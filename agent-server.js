/**
 * Autonomous Trading Agent Server
 * Express server with endpoints to interact with Mastra trading agents
 */

const express = require('express');
const cors = require('cors');
const { mastra } = require('./src/mastra');
const { getAgentMemory } = require('./src/mastra/memory/agent-memory');
require('dotenv').config();

const app = express();
const PORT = process.env.AGENT_PORT || 3001;

// Initialize agent memory
const memory = getAgentMemory();
memory.init().then(() => {
  console.log('✅ Agent memory system initialized');
}).catch(err => {
  console.error('❌ Failed to initialize memory:', err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

/**
 * GET / - Redirect to dashboard
 */
app.get('/', (req, res) => {
  res.redirect('/epl-dashboard.html');
});

/**
 * POST /api/agent/chat
 * Chat with the trading agent
 */
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message, agentName = 'tradingAgent' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const agent = mastra.getAgent(agentName);
    const result = await agent.generate(message);
    
    res.json({
      response: result.text,
      agentName,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in agent chat:', error);
    res.status(500).json({ 
      error: 'Agent chat failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/agent/scan-markets
 * Scan markets for trading opportunities
 */
app.post('/api/agent/scan-markets', async (req, res) => {
  try {
    const { limit = 20, minVolume = 100, minLiquidity = 100, category } = req.body;
    
    const agent = mastra.getAgent('scannerAgent');
    const prompt = `Scan Polymarket markets for trading opportunities. 
    Parameters: limit=${limit}, minVolume=${minVolume}, minLiquidity=${minLiquidity}${category ? `, category=${category}` : ''}
    
    Provide a ranked list of the best opportunities with clear reasoning.`;
    
    const result = await agent.generate(prompt);
    
    res.json({
      analysis: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error scanning markets:', error);
    res.status(500).json({ 
      error: 'Market scan failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/agent/analyze-market
 * Analyze a specific market
 */
app.post('/api/agent/analyze-market', async (req, res) => {
  try {
    const { marketId, analysisType = 'detailed' } = req.body;
    
    if (!marketId) {
      return res.status(400).json({ error: 'marketId is required' });
    }
    
    const agent = mastra.getAgent('tradingAgent');
    const prompt = `Analyze Polymarket market ${marketId} in detail. 
    Provide:
    1. Current probability and market metrics
    2. Your assessment of fair value
    3. Trading recommendation (BUY YES, BUY NO, HOLD, or AVOID)
    4. Risk level and confidence
    5. Optimal position size if trading
    6. Key risks and considerations`;
    
    const result = await agent.generate(prompt);
    
    res.json({
      marketId,
      analysis: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing market:', error);
    res.status(500).json({ 
      error: 'Market analysis failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/agent/execute-trade
 * Execute a trade (with safety checks)
 */
app.post('/api/agent/execute-trade', async (req, res) => {
  try {
    const { marketId, outcome, amount, dryRun = true } = req.body;
    
    if (!marketId || !outcome || !amount) {
      return res.status(400).json({ 
        error: 'marketId, outcome, and amount are required' 
      });
    }
    
    const agent = mastra.getAgent('tradingAgent');
    const prompt = `Execute a trade on market ${marketId}:
    - Outcome: ${outcome}
    - Amount: $${amount}
    - Dry Run: ${dryRun}
    
    Steps:
    1. Analyze the market
    2. Check portfolio risk
    3. Calculate optimal position size
    4. Validate trade against risk criteria
    5. Execute trade (dry run: ${dryRun})
    6. Provide detailed trade report
    
    Be thorough and explain your decision.`;
    
    const result = await agent.generate(prompt);
    
    res.json({
      marketId,
      outcome,
      amount,
      dryRun,
      result: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({ 
      error: 'Trade execution failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/agent/portfolio
 * Get portfolio status and risk analysis
 */
app.get('/api/agent/portfolio', async (req, res) => {
  try {
    const agent = mastra.getAgent('riskManagerAgent');
    const prompt = `Provide a comprehensive portfolio analysis:
    1. Current positions and their status
    2. Total exposure and P&L
    3. Risk metrics and diversification score
    4. Recommendations for portfolio optimization
    5. Any warnings or concerns`;
    
    const result = await agent.generate(prompt);
    
    res.json({
      analysis: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ 
      error: 'Portfolio analysis failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/agent/auto-trade
 * Autonomous trading mode - agent finds and executes trades
 */
app.post('/api/agent/auto-trade', async (req, res) => {
  try {
    const { 
      maxTrades = 3, 
      maxAmountPerTrade = 100,
      dryRun = true,
      category 
    } = req.body;
    
    const agent = mastra.getAgent('tradingAgent');
    const prompt = `Autonomous trading session:
    - Max trades: ${maxTrades}
    - Max amount per trade: $${maxAmountPerTrade}
    - Dry run: ${dryRun}
    ${category ? `- Category: ${category}` : ''}
    
    Execute the following workflow:
    1. Check current portfolio risk
    2. Scan markets for opportunities
    3. Analyze top opportunities in detail
    4. For each viable opportunity:
       a. Calculate optimal position size (max $${maxAmountPerTrade})
       b. Validate against risk criteria
       c. Execute trade if approved (dry run: ${dryRun})
    5. Provide summary of all actions taken
    
    Be conservative and prioritize capital preservation.`;
    
    const result = await agent.generate(prompt);
    
    res.json({
      session: {
        maxTrades,
        maxAmountPerTrade,
        dryRun,
        category
      },
      result: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in auto-trade:', error);
    res.status(500).json({ 
      error: 'Auto-trade failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/agent/sentiment-analysis
 * Analyze sentiment for a topic and find related markets
 */
app.post('/api/agent/sentiment-analysis', async (req, res) => {
  try {
    const { topic, includeNews = true } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const agent = mastra.getAgent('sentimentAnalystAgent');
    const prompt = `Analyze sentiment for "${topic}" and find related Polymarket markets.
    
    Steps:
    1. Analyze Twitter sentiment for "${topic}"
    ${includeNews ? '2. Check recent news about this topic' : ''}
    3. Match sentiment to relevant Polymarket markets
    4. Provide trading recommendations based on sentiment vs market prices
    
    Be thorough and explain your reasoning.`;
    
    const result = await agent.generate(prompt);
    
    res.json({
      topic,
      analysis: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    res.status(500).json({ 
      error: 'Sentiment analysis failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/agent/context-trade
 * Context-aware trading: uses sentiment + news + trends
 */
app.post('/api/agent/context-trade', async (req, res) => {
  try {
    const { topic, maxTrades = 3, dryRun = true } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const agent = mastra.getAgent('contextAwareAgent');
    const prompt = `Find trading opportunities for "${topic}" using sentiment analysis.

Execute these steps:
1. Analyze Twitter sentiment for "${topic}"
2. Find Polymarket markets related to "${topic}"  
3. Compare sentiment to market probabilities
4. Recommend up to ${maxTrades} trades

Be specific and actionable.`;
    
    const result = await agent.generate(prompt, {
      maxSteps: 10
    });
    
    res.json({
      topic,
      maxTrades,
      dryRun,
      result: result.text || 'No result generated',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in context trading:', error);
    res.status(500).json({ 
      error: 'Context trading failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/agent/trends
 * Get trending topics and potential opportunities
 */
app.get('/api/agent/trends', async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    
    const agent = mastra.getAgent('researchAgent');
    const prompt = `Analyze current trending topics in ${category} category and identify potential Polymarket trading opportunities.
    
    Provide:
    1. Top trending topics
    2. Sentiment for each topic
    3. Related Polymarket markets
    4. Trading recommendations`;
    
    const result = await agent.generate(prompt);
    
    res.json({
      category,
      analysis: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing trends:', error);
    res.status(500).json({ 
      error: 'Trend analysis failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/agent/status
 * Get agent status and available agents
 */
app.get('/api/agent/status', (req, res) => {
  res.json({
    status: 'online',
    agents: [
      {
        name: 'tradingAgent',
        description: 'Main autonomous trading agent',
        capabilities: ['market analysis', 'trade execution', 'risk management']
      },
      {
        name: 'scannerAgent',
        description: 'Market scanning specialist',
        capabilities: ['market scanning', 'opportunity identification']
      },
      {
        name: 'riskManagerAgent',
        description: 'Portfolio risk management specialist',
        capabilities: ['risk analysis', 'position sizing', 'portfolio monitoring']
      },
      {
        name: 'contextAwareAgent',
        description: 'Context-aware trading agent (NEW!)',
        capabilities: ['sentiment analysis', 'news aggregation', 'trend analysis', 'context-driven trading']
      },
      {
        name: 'sentimentAnalystAgent',
        description: 'Sentiment analysis specialist (NEW!)',
        capabilities: ['Twitter sentiment', 'news analysis', 'sentiment-market matching']
      },
      {
        name: 'researchAgent',
        description: 'Research specialist (NEW!)',
        capabilities: ['multi-source research', 'trend analysis', 'comprehensive analysis']
      },
      {
        name: 'eplResearchAgent',
        description: 'EPL research specialist (NEW!)',
        capabilities: ['EPL team analysis', 'odds analysis', 'head-to-head', 'value bet finding']
      },
      {
        name: 'eplTradingAgent',
        description: 'EPL trading executor (NEW!)',
        capabilities: ['EPL trade execution', 'wallet management', 'risk management', 'position sizing']
      },
      {
        name: 'eplScoutAgent',
        description: 'EPL market scout (NEW!)',
        capabilities: ['market monitoring', 'opportunity detection', 'odds tracking', 'sentiment monitoring']
      },
      {
        name: 'eplPortfolioAgent',
        description: 'EPL portfolio manager (NEW!)',
        capabilities: ['portfolio tracking', 'performance analysis', 'risk monitoring', 'diversification']
      }
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/wallet/initialize
 * Initialize or get user wallet
 */
app.post('/api/wallet/initialize', async (req, res) => {
  try {
    const { userId, initialBalance = 0 } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const agent = mastra.getAgent('eplTradingAgent');
    const result = await agent.generate(`Initialize wallet for user ${userId} with initial balance $${initialBalance}. Use the initializeWalletTool.`);
    
    res.json({
      success: true,
      message: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error initializing wallet:', error);
    res.status(500).json({ 
      error: 'Wallet initialization failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/wallet/add-funds
 * Add funds to user wallet
 */
app.post('/api/wallet/add-funds', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ error: 'userId and amount are required' });
    }
    
    const agent = mastra.getAgent('eplTradingAgent');
    const result = await agent.generate(`Add $${amount} to wallet for user ${userId}. Use the addFundsTool.`);
    
    res.json({
      success: true,
      message: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error adding funds:', error);
    res.status(500).json({ 
      error: 'Add funds failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/wallet/balance/:userId
 * Get wallet balance
 */
app.get('/api/wallet/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const agent = mastra.getAgent('eplTradingAgent');
    const result = await agent.generate(`Get wallet balance for user ${userId}. Use the getBalanceTool.`);
    
    res.json({
      userId,
      result: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ 
      error: 'Get balance failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/epl/research
 * Deep EPL research for a match or team
 */
app.post('/api/epl/research', async (req, res) => {
  try {
    const { homeTeam, awayTeam, team } = req.body;
    
    if (!homeTeam && !awayTeam && !team) {
      return res.status(400).json({ error: 'Provide homeTeam/awayTeam or team' });
    }
    
    const agent = mastra.getAgent('eplResearchAgent');
    let prompt;
    
    if (homeTeam && awayTeam) {
      prompt = `Conduct deep research on the EPL match: ${homeTeam} vs ${awayTeam}.
      
      Analyze:
      1. Both teams' recent form
      2. Head-to-head history
      3. Current betting odds
      4. Find related Polymarket markets
      5. Identify value betting opportunities
      
      Provide comprehensive analysis with trading recommendations.`;
    } else {
      prompt = `Conduct deep research on EPL team: ${team}.
      
      Analyze:
      1. Recent form and performance
      2. Upcoming fixtures
      3. Key players and injuries
      4. Related Polymarket markets
      
      Provide insights for trading decisions.`;
    }
    
    const result = await agent.generate(prompt, { maxSteps: 10 });
    
    res.json({
      research: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in EPL research:', error);
    res.status(500).json({ 
      error: 'EPL research failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/epl/trade
 * Execute EPL trade with full analysis
 */
app.post('/api/epl/trade', async (req, res) => {
  try {
    const { userId, homeTeam, awayTeam, maxAmount = 100 } = req.body;
    
    if (!userId || !homeTeam || !awayTeam) {
      return res.status(400).json({ error: 'userId, homeTeam, and awayTeam are required' });
    }
    
    const agent = mastra.getAgent('eplTradingAgent');
    const prompt = `Execute EPL trading workflow for user ${userId} on match: ${homeTeam} vs ${awayTeam}.
    
    Steps:
    1. Check user wallet balance
    2. Research the match (form, odds, h2h)
    3. Find related Polymarket markets
    4. Identify best value opportunity
    5. Calculate optimal position size (max $${maxAmount})
    6. Validate trade meets risk criteria
    7. Execute trade (dry run)
    8. Record transaction
    
    Provide detailed report of analysis and trade execution.`;
    
    const result = await agent.generate(prompt, { maxSteps: 15 });
    
    res.json({
      userId,
      match: `${homeTeam} vs ${awayTeam}`,
      result: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in EPL trade:', error);
    res.status(500).json({ 
      error: 'EPL trade failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/epl/scout
 * Scout for EPL trading opportunities
 */
app.get('/api/epl/scout', async (req, res) => {
  try {
    const { minEdge = 5 } = req.query;
    
    const agent = mastra.getAgent('eplScoutAgent');
    const prompt = `Scout for EPL trading opportunities.
    
    Find:
    1. All EPL markets on Polymarket
    2. Current betting odds
    3. Value bets with minimum ${minEdge}% edge
    4. Breaking news or sentiment shifts
    
    Provide ranked list of best opportunities with confidence scores.`;
    
    const result = await agent.generate(prompt, { maxSteps: 10 });
    
    res.json({
      opportunities: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in EPL scout:', error);
    res.status(500).json({ 
      error: 'EPL scout failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/epl/portfolio/:userId
 * Get EPL portfolio summary
 */
app.get('/api/epl/portfolio/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const agent = mastra.getAgent('eplPortfolioAgent');
    const prompt = `Provide portfolio summary for user ${userId}.
    
    Include:
    1. Current wallet balance
    2. Transaction history
    3. Open positions
    4. Performance metrics
    5. Recommendations
    
    Use getBalanceTool and getTransactionHistoryTool.`;
    
    const result = await agent.generate(prompt, { maxSteps: 10 });
    
    res.json({
      userId,
      portfolio: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting portfolio:', error);
    res.status(500).json({ 
      error: 'Portfolio retrieval failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/live/matches
 * Get live EPL matches
 */
app.get('/api/live/matches', async (req, res) => {
  try {
    const agent = mastra.getAgent('liveTradingAgent');
    const result = await agent.generate('Get all live EPL matches with scores and events. Use liveMatchMonitorTool.');
    
    res.json({
      matches: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting live matches:', error);
    res.status(500).json({ 
      error: 'Live matches failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/live/positions/:userId
 * Monitor user's open positions
 */
app.get('/api/live/positions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const agent = mastra.getAgent('liveTradingAgent');
    const result = await agent.generate(`Monitor all open positions for user ${userId}. Use positionMonitorTool to show current P&L and recommendations.`);
    
    res.json({
      userId,
      positions: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error monitoring positions:', error);
    res.status(500).json({ 
      error: 'Position monitoring failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/live/auto-exit
 * Automatically exit positions based on stop-loss/take-profit
 */
app.post('/api/live/auto-exit', async (req, res) => {
  try {
    const { userId, stopLoss = -15, takeProfit = 30, dryRun = true } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const agent = mastra.getAgent('liveTradingAgent');
    const result = await agent.generate(`Execute auto-exit for user ${userId} with stop-loss ${stopLoss}% and take-profit ${takeProfit}%. Dry run: ${dryRun}. Use autoExitTool.`);
    
    res.json({
      userId,
      stopLoss,
      takeProfit,
      result: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in auto-exit:', error);
    res.status(500).json({ 
      error: 'Auto-exit failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/live/alerts/:userId
 * Get live trading alerts
 */
app.get('/api/live/alerts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const agent = mastra.getAgent('liveTradingAgent');
    const result = await agent.generate(`Generate live trading alerts for user ${userId}. Check for goals, red cards, price movements, and stop-loss triggers. Use liveTradingAlertTool.`);
    
    res.json({
      userId,
      alerts: result.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ 
      error: 'Alerts failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/memory/performance/:timeframe
 * Get agent performance metrics
 */
app.get('/api/memory/performance/:timeframe', async (req, res) => {
  try {
    const { timeframe } = req.params;
    const performance = await memory.analyzePerformance(timeframe);
    res.json(performance);
  } catch (error) {
    console.error('Error getting performance:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/memory/trades
 * Get trade history
 */
app.get('/api/memory/trades', async (req, res) => {
  try {
    const trades = await memory.getTradeHistory(req.query);
    res.json({ trades, count: trades.length });
  } catch (error) {
    console.error('Error getting trades:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/memory/opportunities
 * Get recent opportunities
 */
app.get('/api/memory/opportunities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const opportunities = await memory.getRecentOpportunities(limit);
    res.json({ opportunities, count: opportunities.length });
  } catch (error) {
    console.error('Error getting opportunities:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/memory/export
 * Export memory data
 */
app.get('/api/memory/export', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const data = await memory.exportMemory(format);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=agent-memory.csv');
    }
    
    res.send(data);
  } catch (error) {
    console.error('Error exporting memory:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/memory/learnings
 * Get learned patterns
 */
app.get('/api/memory/learnings', async (req, res) => {
  try {
    const patterns = await memory.getLearnedPatterns(req.query);
    res.json({ patterns, count: patterns.length });
  } catch (error) {
    console.error('Error getting learnings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/memory/cleanup
 * Clean old memory entries
 */
app.post('/api/memory/cleanup', async (req, res) => {
  try {
    const cleaned = await memory.cleanup();
    res.json({ cleaned, message: `Cleaned ${cleaned} old entries` });
  } catch (error) {
    console.error('Error cleaning memory:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'EPL Prediction Market Trading Agent',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    polymarketConfigured: !!process.env.POLYMARKET_API_KEY,
    memoryInitialized: memory.initialized
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🤖 Autonomous Trading Agent Server running on http://localhost:${PORT}`);
  console.log(`🧠 Powered by: Mastra AI Framework`);
  console.log(`🔑 OpenAI: ${process.env.OPENAI_API_KEY ? 'Configured ✓' : 'Not configured ✗'}`);
  console.log(`🔑 Polymarket: ${process.env.POLYMARKET_API_KEY ? 'Configured ✓' : 'Not configured ✗'}`);
  console.log(`\n📍 Available Endpoints:`);
  console.log(`   POST /api/agent/chat - Chat with trading agent`);
  console.log(`   POST /api/agent/scan-markets - Scan for opportunities`);
  console.log(`   POST /api/agent/analyze-market - Analyze specific market`);
  console.log(`   POST /api/agent/execute-trade - Execute a trade`);
  console.log(`   POST /api/agent/auto-trade - Autonomous trading session`);
  console.log(`   GET  /api/agent/portfolio - Portfolio analysis`);
  console.log(`   GET  /api/agent/status - Agent status`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`\n⚠️  Default mode: DRY RUN (no real trades executed)`);
  console.log(`✨ Ready to trade autonomously!\n`);
});

module.exports = app;
