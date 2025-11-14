/**
 * Scalable Agent Pool Implementation
 * Demonstrates how to serve 1M users with shared agents
 */

const { mastra } = require('./mastra/index');
const Redis = require('ioredis');

/**
 * Shared Agent Pool
 * ONE instance per server, serves ALL users
 */
class ScalableAgentPool {
  constructor() {
    // Initialize agents ONCE per server
    this.agents = {
      eplTradingAgent: mastra.getAgent('eplTradingAgent'),
      eplScoutAgent: mastra.getAgent('eplScoutAgent'),
      eplResearchAgent: mastra.getAgent('eplResearchAgent'),
      eplPortfolioAgent: mastra.getAgent('eplPortfolioAgent'),
      liveTradingAgent: mastra.getAgent('liveTradingAgent'),
      tradingAgent: mastra.getAgent('tradingAgent'),
      scannerAgent: mastra.getAgent('scannerAgent'),
      riskManagerAgent: mastra.getAgent('riskManagerAgent'),
      contextAwareAgent: mastra.getAgent('contextAwareAgent'),
      sentimentAnalystAgent: mastra.getAgent('sentimentAnalystAgent'),
      researchAgent: mastra.getAgent('researchAgent')
    };

    // Redis for queue and cache
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: 3
    });

    // Metrics
    this.metrics = {
      totalRequests: 0,
      activeRequests: 0,
      errors: 0,
      avgResponseTime: 0
    };

    console.log('✅ Scalable Agent Pool initialized');
    console.log(`   - ${Object.keys(this.agents).length} agents loaded`);
    console.log('   - Ready to serve unlimited users');
  }

  /**
   * Handle user request (stateless)
   * Same agents serve all users
   */
  async handleRequest(userId, agentName, prompt, context = {}) {
    const startTime = Date.now();
    this.metrics.activeRequests++;
    this.metrics.totalRequests++;

    try {
      // Check rate limit
      const allowed = await this.checkRateLimit(userId);
      if (!allowed) {
        throw new Error('Rate limit exceeded. Try again in 1 minute.');
      }

      // Get agent (shared across all users)
      const agent = this.agents[agentName];
      if (!agent) {
        throw new Error(`Agent ${agentName} not found`);
      }

      // Add user context to prompt (NOT stored in agent)
      const contextualPrompt = this.buildContextualPrompt(userId, prompt, context);

      // Execute with agent (stateless)
      const result = await agent.generate(contextualPrompt);

      // Track metrics
      const duration = Date.now() - startTime;
      this.updateMetrics(duration);

      return {
        success: true,
        result: result.text,
        duration,
        agentName,
        userId
      };

    } catch (error) {
      this.metrics.errors++;
      console.error(`Error handling request for user ${userId}:`, error);
      
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        agentName,
        userId
      };

    } finally {
      this.metrics.activeRequests--;
    }
  }

  /**
   * Build contextual prompt with user data
   * User context passed in prompt, NOT stored in agent
   */
  buildContextualPrompt(userId, prompt, context) {
    return `
USER CONTEXT:
- User ID: ${userId}
- Wallet Balance: ${context.balance || 'Unknown'}
- Active Positions: ${context.positions || 0}
- Risk Tolerance: ${context.riskTolerance || 'Medium'}

USER REQUEST:
${prompt}

IMPORTANT: Process this request for user ${userId} only. Do not store any user data.
`;
  }

  /**
   * Rate limiting (per user)
   * Prevents abuse and ensures fair usage
   */
  async checkRateLimit(userId) {
    const key = `ratelimit:${userId}`;
    const limit = 10; // 10 requests per minute
    const window = 60; // 60 seconds

    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }

    return current <= limit;
  }

  /**
   * Queue request for processing
   * Prevents overload during traffic spikes
   */
  async queueRequest(userId, agentName, prompt, context = {}) {
    const request = {
      userId,
      agentName,
      prompt,
      context,
      timestamp: Date.now(),
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Add to Redis queue
    await this.redis.lpush('agent_requests', JSON.stringify(request));

    return request.id;
  }

  /**
   * Process queued requests
   * Worker pattern for high throughput
   */
  async processQueue() {
    while (true) {
      try {
        // Pop request from queue (blocking)
        const result = await this.redis.brpop('agent_requests', 5);
        
        if (!result) continue;

        const [, requestData] = result;
        const request = JSON.parse(requestData);

        // Process request
        const response = await this.handleRequest(
          request.userId,
          request.agentName,
          request.prompt,
          request.context
        );

        // Store result in Redis (for retrieval)
        await this.redis.setex(
          `result:${request.id}`,
          300, // 5 minutes TTL
          JSON.stringify(response)
        );

      } catch (error) {
        console.error('Error processing queue:', error);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s on error
      }
    }
  }

  /**
   * Get cached data
   * Reduces database/API calls
   */
  async getCached(key, ttl, fetchFn) {
    // Try cache first
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Cache miss - fetch and cache
    const data = await fetchFn();
    await this.redis.setex(key, ttl, JSON.stringify(data));
    
    return data;
  }

  /**
   * Update metrics
   */
  updateMetrics(duration) {
    const alpha = 0.1; // Exponential moving average
    this.metrics.avgResponseTime = 
      (alpha * duration) + ((1 - alpha) * this.metrics.avgResponseTime);
  }

  /**
   * Get pool metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      agentsLoaded: Object.keys(this.agents).length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    const healthy = this.metrics.activeRequests < 1000 && 
                    this.metrics.errors < 100;

    return {
      status: healthy ? 'healthy' : 'degraded',
      metrics: this.getMetrics()
    };
  }
}

/**
 * Request Router
 * Routes requests to appropriate agent
 */
class AgentRouter {
  static route(requestType) {
    const routes = {
      'trade': 'eplTradingAgent',
      'scout': 'eplScoutAgent',
      'research': 'eplResearchAgent',
      'portfolio': 'eplPortfolioAgent',
      'monitor': 'liveTradingAgent',
      'scan': 'scannerAgent',
      'risk': 'riskManagerAgent',
      'sentiment': 'sentimentAnalystAgent'
    };

    return routes[requestType] || 'tradingAgent';
  }
}

/**
 * Usage Example
 */
async function exampleUsage() {
  // Initialize pool ONCE per server
  const pool = new ScalableAgentPool();

  // Start queue worker
  pool.processQueue();

  // Handle 1M users with same pool
  const users = ['user1', 'user2', 'user3', /* ... 'user1000000' */];

  for (const userId of users) {
    // All users share the same agents
    const response = await pool.handleRequest(
      userId,
      'eplTradingAgent',
      'Find best EPL trading opportunity',
      { balance: 1000, positions: 2 }
    );

    console.log(`User ${userId}:`, response);
  }

  // Check metrics
  console.log('Pool Metrics:', pool.getMetrics());
}

module.exports = {
  ScalableAgentPool,
  AgentRouter
};
