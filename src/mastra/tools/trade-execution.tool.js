/**
 * Trade Execution Tool for Polymarket Trading Agent
 * Handles order placement and trade execution
 */

const { createTool } = require('@mastra/core/tools');
const { z } = require('zod');
const { polymarket } = require('@goat-sdk/plugin-polymarket');
require('dotenv').config();

// Initialize Polymarket client
const polymarketClient = polymarket({
  credentials: {
    key: process.env.POLYMARKET_API_KEY,
    secret: process.env.POLYMARKET_SECRET,
    passphrase: process.env.POLYMARKET_PASSPHRASE
  }
});

/**
 * Places a trade order on Polymarket
 */
const placeTradeTool = createTool({
  id: 'place-trade',
  description: 'Places a trade order on Polymarket for a specific market outcome. Supports both BUY (long) and SELL (short) positions.',
  inputSchema: z.object({
    marketId: z.string().describe('The ID of the market to trade'),
    outcome: z.enum(['YES', 'NO']).describe('The outcome to bet on'),
    side: z.enum(['BUY', 'SELL']).default('BUY').describe('BUY to go long, SELL to short'),
    amount: z.number().positive().describe('Amount in USD to invest'),
    maxPrice: z.number().min(0.01).max(0.99).optional().describe('Maximum price for BUY or minimum price for SELL'),
    dryRun: z.boolean().default(true).describe('If true, simulates the trade without executing')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    orderId: z.string().optional(),
    marketId: z.string(),
    outcome: z.string(),
    amount: z.number(),
    price: z.number(),
    potentialShares: z.number(),
    estimatedReturn: z.number(),
    message: z.string(),
    dryRun: z.boolean()
  }),
  execute: async ({ context }) => {
    const { marketId, outcome, side = 'BUY', amount, maxPrice, dryRun } = context;
    
    try {
      // Fetch current market data
      const response = await fetch(`http://localhost:3000/api/markets/${marketId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }
      
      const market = await response.json();
      const currentPrice = outcome === 'YES' ? 
        (market.outcomePrices?.[0] || 0.5) : 
        (1 - (market.outcomePrices?.[0] || 0.5));
      
      // For SELL orders, we're shorting - betting against the outcome
      const isSell = side === 'SELL';
      const effectivePrice = isSell ? (1 - currentPrice) : currentPrice;
      
      // Check if price is acceptable
      if (maxPrice !== undefined) {
        if (side === 'BUY' && currentPrice > maxPrice) {
          return {
            success: false,
            marketId,
            outcome,
            side,
            amount,
            price: currentPrice,
            potentialShares: 0,
            estimatedReturn: 0,
            message: `Current price ${currentPrice.toFixed(3)} exceeds max buy price ${maxPrice.toFixed(3)}`,
            dryRun
          };
        }
        if (side === 'SELL' && currentPrice < maxPrice) {
          return {
            success: false,
            marketId,
            outcome,
            side,
            amount,
            price: currentPrice,
            potentialShares: 0,
            estimatedReturn: 0,
            message: `Current price ${currentPrice.toFixed(3)} below min sell price ${maxPrice.toFixed(3)}`,
            dryRun
          };
        }
      }
      
      // Calculate potential shares and return
      const potentialShares = amount / effectivePrice;
      const estimatedReturn = isSell ? 
        ((1 - currentPrice) * potentialShares - amount) / amount * 100 :
        (potentialShares - amount) / amount * 100;
      
      if (dryRun) {
        const action = isSell ? 'short' : 'buy';
        const priceDesc = isSell ? `(shorting at $${currentPrice.toFixed(3)}, profit if price drops)` : `at $${currentPrice.toFixed(3)} each`;
        
        return {
          success: true,
          orderId: `DRY_RUN_${Date.now()}`,
          marketId,
          outcome,
          side,
          amount,
          price: currentPrice,
          potentialShares: Math.round(potentialShares * 100) / 100,
          estimatedReturn: Math.round(estimatedReturn * 100) / 100,
          message: `DRY RUN: Would ${action} ${potentialShares.toFixed(2)} ${outcome} shares ${priceDesc}`,
          dryRun: true
        };
      }
      
      // ACTUAL TRADE EXECUTION
      // Note: This requires proper Polymarket API credentials and wallet setup
      try {
        const order = await polymarketClient.createOrder({
          marketId,
          outcome: outcome === 'YES' ? 0 : 1,
          side: side, // 'BUY' or 'SELL'
          size: potentialShares,
          price: currentPrice
        });
        
        return {
          success: true,
          orderId: order.id,
          marketId,
          outcome,
          amount,
          price: currentPrice,
          potentialShares: Math.round(potentialShares * 100) / 100,
          estimatedReturn: Math.round(estimatedReturn * 100) / 100,
          message: `Successfully placed order for ${potentialShares.toFixed(2)} ${outcome} shares`,
          dryRun: false
        };
      } catch (tradeError) {
        return {
          success: false,
          marketId,
          outcome,
          amount,
          price: currentPrice,
          potentialShares: 0,
          estimatedReturn: 0,
          message: `Trade execution failed: ${tradeError.message}`,
          dryRun: false
        };
      }
      
    } catch (error) {
      console.error('Error placing trade:', error);
      throw new Error(`Trade placement failed: ${error.message}`);
    }
  }
});

/**
 * Gets current positions and portfolio status
 */
const getPositionsTool = createTool({
  id: 'get-positions',
  description: 'Retrieves current trading positions and portfolio status',
  inputSchema: z.object({
    includeHistory: z.boolean().default(false).describe('Include historical trades')
  }),
  outputSchema: z.object({
    positions: z.array(z.object({
      marketId: z.string(),
      question: z.string(),
      outcome: z.string(),
      shares: z.number(),
      avgPrice: z.number(),
      currentPrice: z.number(),
      unrealizedPnL: z.number(),
      unrealizedPnLPercent: z.number()
    })),
    totalValue: z.number(),
    totalInvested: z.number(),
    totalPnL: z.number(),
    totalPnLPercent: z.number()
  }),
  execute: async ({ context }) => {
    const { includeHistory } = context;
    
    try {
      // In a real implementation, this would fetch from Polymarket API
      // For now, return mock data structure
      
      // Note: Actual implementation requires:
      // const positions = await polymarketClient.getPositions();
      
      return {
        positions: [],
        totalValue: 0,
        totalInvested: 0,
        totalPnL: 0,
        totalPnLPercent: 0
      };
      
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw new Error(`Failed to fetch positions: ${error.message}`);
    }
  }
});

/**
 * Cancels an open order
 */
const cancelOrderTool = createTool({
  id: 'cancel-order',
  description: 'Cancels an open order on Polymarket',
  inputSchema: z.object({
    orderId: z.string().describe('The ID of the order to cancel')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    orderId: z.string(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    const { orderId } = context;
    
    try {
      // Check if it's a dry run order
      if (orderId.startsWith('DRY_RUN_')) {
        return {
          success: true,
          orderId,
          message: 'Dry run order cancelled (no actual order was placed)'
        };
      }
      
      // Actual order cancellation
      await polymarketClient.cancelOrder(orderId);
      
      return {
        success: true,
        orderId,
        message: 'Order successfully cancelled'
      };
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        orderId,
        message: `Failed to cancel order: ${error.message}`
      };
    }
  }
});

module.exports = {
  placeTradeTool,
  getPositionsTool,
  cancelOrderTool
};
