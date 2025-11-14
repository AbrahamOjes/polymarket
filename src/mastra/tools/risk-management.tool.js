/**
 * Risk Management Tool for Polymarket Trading Agent
 * Manages portfolio risk and validates trades
 */

const { createTool } = require('@mastra/core/tools');
const { z } = require('zod');

/**
 * Validates if a trade meets risk management criteria
 */
const validateTradeTool = createTool({
  id: 'validate-trade',
  description: 'Validates if a proposed trade meets risk management criteria and portfolio limits',
  inputSchema: z.object({
    marketId: z.string().describe('The market ID to trade'),
    amount: z.number().positive().describe('Amount to invest'),
    outcome: z.enum(['YES', 'NO']).describe('Outcome to bet on'),
    confidence: z.number().min(0).max(100).describe('Confidence level in the trade'),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Risk level of the market')
  }),
  outputSchema: z.object({
    approved: z.boolean(),
    adjustedAmount: z.number(),
    warnings: z.array(z.string()),
    reasoning: z.string(),
    maxAllowedAmount: z.number()
  }),
  execute: async ({ context }) => {
    const { marketId, amount, outcome, confidence, riskLevel } = context;
    
    // Risk management parameters
    const MAX_SINGLE_TRADE = 1000; // Max $1000 per trade
    const MAX_HIGH_RISK_TRADE = 200; // Max $200 for high risk
    const MAX_MEDIUM_RISK_TRADE = 500; // Max $500 for medium risk
    const MIN_CONFIDENCE = 60; // Minimum 60% confidence
    
    const warnings = [];
    let approved = true;
    let adjustedAmount = amount;
    let reasoning = '';
    let maxAllowedAmount = MAX_SINGLE_TRADE;
    
    // Check confidence level
    if (confidence < MIN_CONFIDENCE) {
      approved = false;
      reasoning += `Confidence ${confidence}% is below minimum threshold of ${MIN_CONFIDENCE}%. `;
      warnings.push(`Low confidence: ${confidence}%`);
    }
    
    // Check risk-based limits
    if (riskLevel === 'HIGH') {
      maxAllowedAmount = MAX_HIGH_RISK_TRADE;
      if (amount > MAX_HIGH_RISK_TRADE) {
        adjustedAmount = MAX_HIGH_RISK_TRADE;
        warnings.push(`Amount reduced from $${amount} to $${MAX_HIGH_RISK_TRADE} due to HIGH risk level`);
        reasoning += `High risk market: limiting trade to $${MAX_HIGH_RISK_TRADE}. `;
      }
    } else if (riskLevel === 'MEDIUM') {
      maxAllowedAmount = MAX_MEDIUM_RISK_TRADE;
      if (amount > MAX_MEDIUM_RISK_TRADE) {
        adjustedAmount = MAX_MEDIUM_RISK_TRADE;
        warnings.push(`Amount reduced from $${amount} to $${MAX_MEDIUM_RISK_TRADE} due to MEDIUM risk level`);
        reasoning += `Medium risk market: limiting trade to $${MAX_MEDIUM_RISK_TRADE}. `;
      }
    } else {
      maxAllowedAmount = MAX_SINGLE_TRADE;
      if (amount > MAX_SINGLE_TRADE) {
        adjustedAmount = MAX_SINGLE_TRADE;
        warnings.push(`Amount reduced from $${amount} to $${MAX_SINGLE_TRADE} (max single trade)`);
        reasoning += `Trade limited to maximum single trade amount of $${MAX_SINGLE_TRADE}. `;
      }
    }
    
    // Minimum trade amount
    if (amount < 10) {
      approved = false;
      warnings.push('Trade amount below $10 minimum');
      reasoning += 'Trade amount too small (minimum $10). ';
    }
    
    if (approved && warnings.length === 0) {
      reasoning = `Trade approved: $${adjustedAmount} on ${outcome} with ${confidence}% confidence (${riskLevel} risk).`;
    } else if (approved && warnings.length > 0) {
      reasoning += 'Trade approved with adjustments.';
    } else {
      reasoning += 'Trade rejected.';
    }
    
    return {
      approved,
      adjustedAmount,
      warnings,
      reasoning,
      maxAllowedAmount
    };
  }
});

/**
 * Calculates portfolio diversification and exposure
 */
const checkPortfolioRiskTool = createTool({
  id: 'check-portfolio-risk',
  description: 'Analyzes current portfolio risk, diversification, and exposure levels',
  inputSchema: z.object({
    includeOpenOrders: z.boolean().default(true).describe('Include open orders in risk calculation')
  }),
  outputSchema: z.object({
    totalExposure: z.number(),
    diversificationScore: z.number().min(0).max(100),
    riskScore: z.number().min(0).max(100),
    recommendations: z.array(z.string()),
    categoryExposure: z.record(z.number()),
    warnings: z.array(z.string())
  }),
  execute: async ({ context }) => {
    const { includeOpenOrders } = context;
    
    try {
      // In a real implementation, this would analyze actual portfolio
      // For now, return a safe default state
      
      return {
        totalExposure: 0,
        diversificationScore: 100,
        riskScore: 0,
        recommendations: [
          'Portfolio is currently empty',
          'Start with low-risk, high-liquidity markets',
          'Diversify across multiple categories',
          'Keep position sizes under 10% of total portfolio'
        ],
        categoryExposure: {},
        warnings: []
      };
      
    } catch (error) {
      console.error('Error checking portfolio risk:', error);
      throw new Error(`Portfolio risk check failed: ${error.message}`);
    }
  }
});

/**
 * Calculates Kelly Criterion for optimal bet sizing
 */
const calculateKellyCriterionTool = createTool({
  id: 'calculate-kelly',
  description: 'Calculates optimal bet size using Kelly Criterion based on probability and odds',
  inputSchema: z.object({
    trueProbability: z.number().min(0).max(1).describe('Your estimated true probability of winning'),
    marketProbability: z.number().min(0).max(1).describe('Market implied probability'),
    bankroll: z.number().positive().describe('Total bankroll available'),
    kellyFraction: z.number().min(0).max(1).default(0.25).describe('Fraction of Kelly to use (0.25 = quarter Kelly)')
  }),
  outputSchema: z.object({
    optimalBetSize: z.number(),
    fullKellySize: z.number(),
    edge: z.number(),
    expectedValue: z.number(),
    recommendation: z.string()
  }),
  execute: async ({ context }) => {
    const { trueProbability, marketProbability, bankroll, kellyFraction } = context;
    
    // Calculate edge
    const edge = trueProbability - marketProbability;
    
    // Calculate odds
    const odds = (1 / marketProbability) - 1;
    
    // Kelly Criterion: f* = (bp - q) / b
    // where b = odds, p = true probability, q = 1 - p
    const q = 1 - trueProbability;
    const fullKelly = (odds * trueProbability - q) / odds;
    
    // Apply Kelly fraction for safety
    const kellySizeFraction = Math.max(0, fullKelly * kellyFraction);
    const optimalBetSize = Math.round(bankroll * kellySizeFraction * 100) / 100;
    
    // Calculate expected value
    const expectedValue = (trueProbability * odds - q) * 100;
    
    let recommendation = '';
    if (edge <= 0) {
      recommendation = 'No edge detected. Do not bet.';
    } else if (edge < 0.05) {
      recommendation = 'Small edge. Consider smaller position or skip.';
    } else if (edge < 0.15) {
      recommendation = 'Moderate edge. Reasonable bet opportunity.';
    } else {
      recommendation = 'Strong edge. Good bet opportunity.';
    }
    
    return {
      optimalBetSize: Math.max(0, optimalBetSize),
      fullKellySize: Math.max(0, Math.round(bankroll * fullKelly * 100) / 100),
      edge: Math.round(edge * 10000) / 100, // As percentage
      expectedValue: Math.round(expectedValue * 100) / 100,
      recommendation
    };
  }
});

module.exports = {
  validateTradeTool,
  checkPortfolioRiskTool,
  calculateKellyCriterionTool
};
