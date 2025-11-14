/**
 * Market Analysis Tool for Polymarket Trading Agent
 * Analyzes market data to identify trading opportunities
 */

const { createTool } = require('@mastra/core/tools');
const { z } = require('zod');

/**
 * Analyzes a specific market for trading opportunities
 */
const analyzeMarketTool = createTool({
  id: 'analyze-market',
  description: 'Analyzes a Polymarket market to identify trading opportunities based on probability, volume, liquidity, and market sentiment',
  inputSchema: z.object({
    marketId: z.string().describe('The ID of the market to analyze'),
    analysisType: z.enum(['quick', 'detailed']).default('quick').describe('Type of analysis to perform')
  }),
  outputSchema: z.object({
    marketId: z.string(),
    question: z.string(),
    currentProbability: z.number(),
    volume: z.number(),
    liquidity: z.number(),
    recommendation: z.enum(['BUY_YES', 'BUY_NO', 'HOLD', 'AVOID']),
    confidence: z.number().min(0).max(100),
    reasoning: z.string(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    potentialReturn: z.number()
  }),
  execute: async ({ context }) => {
    const { marketId, analysisType } = context;
    
    try {
      // Fetch market data from local API
      const response = await fetch(`http://localhost:3000/api/markets/${marketId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }
      
      const market = await response.json();
      
      // Extract key metrics
      // Parse outcomePrices (it's a JSON string)
      let probability = 0.5;
      try {
        const prices = typeof market.outcomePrices === 'string' ? 
          JSON.parse(market.outcomePrices) : market.outcomePrices;
        probability = parseFloat(prices?.[0]) || 0.5;
      } catch (e) {
        probability = 0.5;
      }
      const volume = market.volumeClob || market.volume || 0;
      const liquidity = market.liquidityClob || market.liquidity || 0;
      const endDate = new Date(market.endDate);
      const daysUntilClose = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
      
      // Analysis logic
      let recommendation = 'HOLD';
      let confidence = 50;
      let reasoning = '';
      let riskLevel = 'MEDIUM';
      let potentialReturn = 0;
      
      // High volume + reasonable liquidity = safer bet
      if (volume > 100000 && liquidity > 50000) {
        riskLevel = 'LOW';
        confidence += 10;
      } else if (volume < 10000 || liquidity < 5000) {
        riskLevel = 'HIGH';
        confidence -= 15;
      }
      
      // Probability analysis
      if (probability < 0.3) {
        // Undervalued YES opportunity
        recommendation = 'BUY_YES';
        potentialReturn = ((1 / probability) - 1) * 100;
        confidence += 15;
        reasoning = `Market shows ${(probability * 100).toFixed(1)}% probability. Potential undervaluation detected. `;
      } else if (probability > 0.7) {
        // Overvalued YES, consider NO
        recommendation = 'BUY_NO';
        potentialReturn = ((1 / (1 - probability)) - 1) * 100;
        confidence += 15;
        reasoning = `Market shows ${(probability * 100).toFixed(1)}% probability. Potential overvaluation detected. `;
      } else {
        recommendation = 'HOLD';
        reasoning = `Market probability at ${(probability * 100).toFixed(1)}% is fairly priced. `;
      }
      
      // Time decay consideration
      if (daysUntilClose < 7) {
        confidence -= 10;
        reasoning += `Market closes in ${daysUntilClose} days - limited time for price movement. `;
      } else if (daysUntilClose > 90) {
        confidence -= 5;
        reasoning += `Market closes in ${daysUntilClose} days - long time horizon increases uncertainty. `;
      }
      
      // Volume and liquidity bonus
      reasoning += `Volume: $${(volume / 1000).toFixed(1)}K, Liquidity: $${(liquidity / 1000).toFixed(1)}K. `;
      
      // Avoid low confidence trades
      if (confidence < 40) {
        recommendation = 'AVOID';
        reasoning += 'Confidence too low for trade execution.';
      }
      
      return {
        marketId: market.id,
        question: market.question,
        currentProbability: probability,
        volume,
        liquidity,
        recommendation,
        confidence: Math.max(0, Math.min(100, confidence)),
        reasoning,
        riskLevel,
        potentialReturn: Math.round(potentialReturn * 100) / 100
      };
      
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw new Error(`Market analysis failed: ${error.message}`);
    }
  }
});

/**
 * Scans multiple markets to find best trading opportunities
 */
const scanMarketsTool = createTool({
  id: 'scan-markets',
  description: 'Scans multiple Polymarket markets to find the best trading opportunities based on specified criteria',
  inputSchema: z.object({
    limit: z.number().default(20).describe('Number of markets to scan'),
    minVolume: z.number().default(1000).describe('Minimum volume threshold'),
    minLiquidity: z.number().default(1000).describe('Minimum liquidity threshold'),
    category: z.string().optional().describe('Filter by category (e.g., sports, politics, crypto)')
  }),
  outputSchema: z.object({
    opportunities: z.array(z.object({
      marketId: z.string(),
      question: z.string(),
      probability: z.number(),
      recommendation: z.string(),
      confidence: z.number(),
      potentialReturn: z.number(),
      riskLevel: z.string()
    })),
    totalScanned: z.number(),
    timestamp: z.string()
  }),
  execute: async ({ context }) => {
    const { limit, minVolume, minLiquidity, category } = context;
    
    try {
      // Fetch markets from local API
      let url = `http://localhost:3000/api/markets?limit=${limit}&active=true`;
      if (category === 'sports') {
        url = `http://localhost:3000/api/markets/sports?limit=${limit}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch markets: ${response.statusText}`);
      }
      
      const markets = await response.json();
      const opportunities = [];
      
      // Analyze each market
      for (const market of markets) {
        // Polymarket uses volumeClob and liquidityClob
        const volume = market.volumeClob || market.volume || 0;
        const liquidity = market.liquidityClob || market.liquidity || 0;
        
        // Filter by volume and liquidity
        if (volume < minVolume || liquidity < minLiquidity) {
          continue;
        }
        
        // Parse outcomePrices (it's a JSON string)
        let probability = 0.5;
        try {
          const prices = typeof market.outcomePrices === 'string' ? 
            JSON.parse(market.outcomePrices) : market.outcomePrices;
          probability = parseFloat(prices?.[0]) || 0.5;
        } catch (e) {
          probability = 0.5;
        }
        
        // Look for mispriced markets
        let recommendation = 'HOLD';
        let confidence = 50;
        let potentialReturn = 0;
        let riskLevel = 'MEDIUM';
        
        if (probability < 0.40) {
          recommendation = 'BUY_YES';
          potentialReturn = ((1 / probability) - 1) * 100;
          confidence = 60;
          riskLevel = volume > 50000 ? 'LOW' : 'MEDIUM';
        } else if (probability > 0.60) {
          recommendation = 'BUY_NO';
          potentialReturn = ((1 / (1 - probability)) - 1) * 100;
          confidence = 60;
          riskLevel = volume > 50000 ? 'LOW' : 'MEDIUM';
        }
        
        // Only include actionable opportunities (more lenient threshold)
        if (recommendation !== 'HOLD' && confidence > 50) {
          opportunities.push({
            marketId: market.id,
            question: market.question,
            probability,
            recommendation,
            confidence,
            potentialReturn: Math.round(potentialReturn * 100) / 100,
            riskLevel
          });
        }
      }
      
      // Sort by confidence and potential return
      opportunities.sort((a, b) => {
        const scoreA = a.confidence * 0.6 + a.potentialReturn * 0.4;
        const scoreB = b.confidence * 0.6 + b.potentialReturn * 0.4;
        return scoreB - scoreA;
      });
      
      return {
        opportunities: opportunities.slice(0, 10), // Top 10
        totalScanned: markets.length,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error scanning markets:', error);
      throw new Error(`Market scan failed: ${error.message}`);
    }
  }
});

module.exports = {
  analyzeMarketTool,
  scanMarketsTool
};
