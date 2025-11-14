/**
 * Mastra Configuration
 * Central configuration for all agents and tools
 */

const { eplResearchAgent, eplTradingAgent, eplScoutAgent, eplPortfolioAgent } = require('./agents/epl-agents');
const { liveTradingAgent } = require('./agents/live-trading-agent');

// Create a simple mastra object with agents
const mastra = {
  agents: {
    eplResearchAgent,
    eplTradingAgent,
    eplScoutAgent,
    eplPortfolioAgent,
    liveTradingAgent
  },
  getAgent(name) {
    return this.agents[name];
  }
};

module.exports = { mastra };
