/**
 * Agent Memory System
 * Stores and analyzes agent decisions, trades, and performance
 */

const fs = require('fs').promises;
const path = require('path');

class AgentMemory {
  constructor(config = {}) {
    this.memoryDir = config.memoryDir || path.join(__dirname, '../../../data/memory');
    this.maxMemorySize = config.maxMemorySize || 10000; // Max entries
    this.retentionDays = config.retentionDays || 90; // Keep data for 90 days
    
    this.memory = {
      decisions: [],      // All agent decisions
      trades: [],         // Executed trades
      opportunities: [],  // Found opportunities
      performance: [],    // Performance metrics
      learnings: []       // Learned patterns
    };
    
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // Create memory directory
    await fs.mkdir(this.memoryDir, { recursive: true });
    
    // Load existing memory
    await this.loadMemory();
    
    this.initialized = true;
    console.log('✅ Agent Memory initialized');
  }

  /**
   * Record a decision made by the agent
   */
  async recordDecision(decision) {
    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'decision',
      agentName: decision.agentName,
      action: decision.action,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
      outcome: decision.outcome,
      marketId: decision.marketId,
      metadata: decision.metadata || {}
    };
    
    this.memory.decisions.push(entry);
    await this.persist('decisions');
    
    return entry;
  }

  /**
   * Record a trade execution
   */
  async recordTrade(trade) {
    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'trade',
      userId: trade.userId,
      marketId: trade.marketId,
      outcome: trade.outcome,
      side: trade.side,
      amount: trade.amount,
      price: trade.price,
      expectedValue: trade.expectedValue,
      edge: trade.edge,
      confidence: trade.confidence,
      dryRun: trade.dryRun,
      result: trade.result,
      metadata: trade.metadata || {}
    };
    
    this.memory.trades.push(entry);
    await this.persist('trades');
    
    return entry;
  }

  /**
   * Record an opportunity found
   */
  async recordOpportunity(opportunity) {
    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'opportunity',
      marketId: opportunity.marketId,
      market: opportunity.market,
      edge: opportunity.edge,
      confidence: opportunity.confidence,
      expectedValue: opportunity.expectedValue,
      recommendation: opportunity.recommendation,
      wasTraded: false,
      metadata: opportunity.metadata || {}
    };
    
    this.memory.opportunities.push(entry);
    await this.persist('opportunities');
    
    return entry;
  }

  /**
   * Record performance metrics
   */
  async recordPerformance(metrics) {
    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'performance',
      totalTrades: metrics.totalTrades,
      successfulTrades: metrics.successfulTrades,
      failedTrades: metrics.failedTrades,
      totalProfit: metrics.totalProfit,
      totalLoss: metrics.totalLoss,
      winRate: metrics.winRate,
      averageEdge: metrics.averageEdge,
      averageConfidence: metrics.averageConfidence,
      sharpeRatio: metrics.sharpeRatio,
      metadata: metrics.metadata || {}
    };
    
    this.memory.performance.push(entry);
    await this.persist('performance');
    
    return entry;
  }

  /**
   * Record a learned pattern
   */
  async recordLearning(learning) {
    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'learning',
      pattern: learning.pattern,
      context: learning.context,
      outcome: learning.outcome,
      confidence: learning.confidence,
      applicability: learning.applicability,
      metadata: learning.metadata || {}
    };
    
    this.memory.learnings.push(entry);
    await this.persist('learnings');
    
    return entry;
  }

  /**
   * Analyze agent performance
   */
  async analyzePerformance(timeframe = '7d') {
    const cutoffDate = this.getTimeframeCutoff(timeframe);
    const recentTrades = this.memory.trades.filter(t => 
      new Date(t.timestamp) >= cutoffDate && !t.dryRun
    );
    
    if (recentTrades.length === 0) {
      return {
        timeframe,
        totalTrades: 0,
        message: 'No trades in this timeframe'
      };
    }
    
    const successful = recentTrades.filter(t => t.result?.success);
    const failed = recentTrades.filter(t => !t.result?.success);
    
    const totalProfit = successful.reduce((sum, t) => sum + (t.result?.profit || 0), 0);
    const totalLoss = failed.reduce((sum, t) => sum + Math.abs(t.result?.loss || 0), 0);
    
    const avgEdge = recentTrades.reduce((sum, t) => sum + (t.edge || 0), 0) / recentTrades.length;
    const avgConfidence = recentTrades.reduce((sum, t) => sum + (t.confidence || 0), 0) / recentTrades.length;
    
    return {
      timeframe,
      totalTrades: recentTrades.length,
      successfulTrades: successful.length,
      failedTrades: failed.length,
      winRate: (successful.length / recentTrades.length) * 100,
      totalProfit,
      totalLoss,
      netProfit: totalProfit - totalLoss,
      averageEdge: avgEdge,
      averageConfidence: avgConfidence,
      roi: ((totalProfit - totalLoss) / (totalProfit + totalLoss)) * 100
    };
  }

  /**
   * Find similar past decisions
   */
  async findSimilarDecisions(context) {
    const { marketType, edge, confidence } = context;
    
    return this.memory.decisions.filter(d => {
      const edgeMatch = Math.abs((d.metadata?.edge || 0) - edge) < 10;
      const confidenceMatch = Math.abs((d.confidence || 0) - confidence) < 15;
      return edgeMatch && confidenceMatch;
    });
  }

  /**
   * Get learned patterns
   */
  async getLearnedPatterns(context = {}) {
    return this.memory.learnings.filter(l => {
      if (context.minConfidence && l.confidence < context.minConfidence) {
        return false;
      }
      return true;
    }).sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get recent opportunities
   */
  async getRecentOpportunities(limit = 10) {
    return this.memory.opportunities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get trade history
   */
  async getTradeHistory(filters = {}) {
    let trades = [...this.memory.trades];
    
    if (filters.userId) {
      trades = trades.filter(t => t.userId === filters.userId);
    }
    
    if (filters.marketId) {
      trades = trades.filter(t => t.marketId === filters.marketId);
    }
    
    if (filters.startDate) {
      trades = trades.filter(t => new Date(t.timestamp) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      trades = trades.filter(t => new Date(t.timestamp) <= new Date(filters.endDate));
    }
    
    return trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Export memory for analysis
   */
  async exportMemory(format = 'json') {
    const exportData = {
      exported: new Date().toISOString(),
      version: '1.0',
      stats: {
        decisions: this.memory.decisions.length,
        trades: this.memory.trades.length,
        opportunities: this.memory.opportunities.length,
        performance: this.memory.performance.length,
        learnings: this.memory.learnings.length
      },
      data: this.memory
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(exportData);
    }
    
    return exportData;
  }

  /**
   * Clean old memory entries
   */
  async cleanup() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    
    let cleaned = 0;
    
    for (const key of Object.keys(this.memory)) {
      const before = this.memory[key].length;
      this.memory[key] = this.memory[key].filter(entry => 
        new Date(entry.timestamp) >= cutoffDate
      );
      cleaned += before - this.memory[key].length;
    }
    
    if (cleaned > 0) {
      await this.persistAll();
      console.log(`🧹 Cleaned ${cleaned} old memory entries`);
    }
    
    return cleaned;
  }

  /**
   * Persist memory to disk
   */
  async persist(category) {
    const filePath = path.join(this.memoryDir, `${category}.json`);
    await fs.writeFile(filePath, JSON.stringify(this.memory[category], null, 2));
  }

  async persistAll() {
    for (const category of Object.keys(this.memory)) {
      await this.persist(category);
    }
  }

  /**
   * Load memory from disk
   */
  async loadMemory() {
    for (const category of Object.keys(this.memory)) {
      const filePath = path.join(this.memoryDir, `${category}.json`);
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        this.memory[category] = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet, that's okay
        this.memory[category] = [];
      }
    }
  }

  /**
   * Helper methods
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getTimeframeCutoff(timeframe) {
    const now = new Date();
    const match = timeframe.match(/(\d+)([dhwm])/);
    
    if (!match) return new Date(0);
    
    const [, amount, unit] = match;
    const value = parseInt(amount);
    
    switch (unit) {
      case 'd': return new Date(now - value * 24 * 60 * 60 * 1000);
      case 'h': return new Date(now - value * 60 * 60 * 1000);
      case 'w': return new Date(now - value * 7 * 24 * 60 * 60 * 1000);
      case 'm': return new Date(now - value * 30 * 24 * 60 * 60 * 1000);
      default: return new Date(0);
    }
  }

  convertToCSV(data) {
    // Simple CSV conversion for trades
    const trades = data.data.trades;
    if (trades.length === 0) return '';
    
    const headers = Object.keys(trades[0]).join(',');
    const rows = trades.map(t => Object.values(t).join(','));
    
    return [headers, ...rows].join('\n');
  }
}

// Singleton instance
let memoryInstance = null;

function getAgentMemory(config) {
  if (!memoryInstance) {
    memoryInstance = new AgentMemory(config);
  }
  return memoryInstance;
}

module.exports = {
  AgentMemory,
  getAgentMemory
};
