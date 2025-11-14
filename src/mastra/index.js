/**
 * Mastra Configuration
 * Central configuration for all agents and tools
 */

const { Mastra } = require('@mastra/core');
const { tradingAgent, scannerAgent, riskManagerAgent } = require('./agents/trading-agent');
const { contextAwareAgent, sentimentAnalystAgent, researchAgent } = require('./agents/context-aware-agent');
const { eplResearchAgent, eplTradingAgent, eplScoutAgent, eplPortfolioAgent } = require('./agents/epl-agents');
const { liveTradingAgent } = require('./agents/live-trading-agent');

// Initialize Mastra instance
const mastra = new Mastra({
  agents: {
    // Original agents
    tradingAgent,
    scannerAgent,
    riskManagerAgent,
    
    // Context-aware agents
    contextAwareAgent,
    sentimentAnalystAgent,
    researchAgent,
    
    // EPL specialist agents
    eplResearchAgent,
    eplTradingAgent,
    eplScoutAgent,
    eplPortfolioAgent,
    
    // Live trading agent (NEW!)
    liveTradingAgent
  }
});

module.exports = { mastra };
