/**
 * Live Match Monitoring Tools
 * Real-time tracking of matches and automatic position management
 */

const { createTool } = require('@mastra/core/tools');
const { z } = require('zod');

/**
 * Live Match Monitor Tool
 * Tracks live match events and scores
 */
const liveMatchMonitorTool = createTool({
  id: 'live-match-monitor',
  description: 'Monitors live EPL matches in real-time, tracking scores, events, and market movements.',
  inputSchema: z.object({
    matchId: z.string().optional().describe('Specific match to monitor, or all live matches'),
    includeEvents: z.boolean().default(true).describe('Include goals, cards, substitutions')
  }),
  outputSchema: z.object({
    liveMatches: z.array(z.object({
      matchId: z.string(),
      homeTeam: z.string(),
      awayTeam: z.string(),
      score: z.object({
        home: z.number(),
        away: z.number()
      }),
      minute: z.number(),
      status: z.enum(['LIVE', 'HT', 'FT', 'POSTPONED']),
      events: z.array(z.object({
        minute: z.number(),
        type: z.enum(['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION']),
        team: z.string(),
        player: z.string()
      })).optional()
    })),
    timestamp: z.string()
  }),
  execute: async ({ context }) => {
    const { matchId, includeEvents } = context;
    
    try {
      // NOTE: In production, integrate with:
      // - API-Football for live scores
      // - LiveScore API
      // - Official Premier League API
      
      // Simulated live match data
      const liveMatches = await simulateLiveMatches(matchId, includeEvents);
      
      return {
        liveMatches,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error monitoring live matches:', error);
      throw new Error(`Live match monitoring failed: ${error.message}`);
    }
  }
});

/**
 * Position Monitor Tool
 * Tracks open positions and market price movements
 */
const positionMonitorTool = createTool({
  id: 'position-monitor',
  description: 'Monitors open trading positions and current market prices to detect profit/loss changes.',
  inputSchema: z.object({
    userId: z.string().describe('User ID to check positions for'),
    marketIds: z.array(z.string()).optional().describe('Specific markets to monitor')
  }),
  outputSchema: z.object({
    positions: z.array(z.object({
      marketId: z.string(),
      marketQuestion: z.string(),
      outcome: z.string(),
      side: z.string(),
      entryPrice: z.number(),
      currentPrice: z.number(),
      shares: z.number(),
      invested: z.number(),
      currentValue: z.number(),
      profitLoss: z.number(),
      profitLossPercent: z.number(),
      recommendation: z.enum(['HOLD', 'SELL', 'BUY_MORE', 'URGENT_SELL'])
    })),
    totalProfitLoss: z.number(),
    timestamp: z.string()
  }),
  execute: async ({ context }) => {
    const { userId, marketIds } = context;
    
    try {
      // Get user's transaction history to find open positions
      const walletsPath = require('path').join(__dirname, '../../../data/wallets.json');
      const fs = require('fs').promises;
      
      let wallets = {};
      try {
        const data = await fs.readFile(walletsPath, 'utf8');
        wallets = JSON.parse(data);
      } catch {
        wallets = {};
      }
      
      const userWallet = wallets[userId];
      if (!userWallet) {
        return {
          positions: [],
          totalProfitLoss: 0,
          timestamp: new Date().toISOString()
        };
      }
      
      // Get trade transactions
      const trades = (userWallet.transactions || []).filter(t => t.type === 'trade');
      
      // Group by market and calculate positions
      const positionMap = {};
      for (const trade of trades) {
        const key = `${trade.marketId}_${trade.outcome}`;
        if (!positionMap[key]) {
          positionMap[key] = {
            marketId: trade.marketId,
            outcome: trade.outcome,
            side: trade.tradeType,
            shares: 0,
            invested: 0,
            entryPrice: 0
          };
        }
        
        if (trade.tradeType === 'BUY') {
          positionMap[key].shares += trade.amount / trade.price;
          positionMap[key].invested += trade.amount;
        } else {
          positionMap[key].shares -= trade.amount / trade.price;
          positionMap[key].invested -= trade.amount;
        }
      }
      
      // Get current prices and calculate P&L
      const positions = [];
      let totalProfitLoss = 0;
      
      for (const [key, position] of Object.entries(positionMap)) {
        if (position.shares === 0) continue; // Closed position
        
        // Fetch current market price
        try {
          const response = await fetch(`https://gamma-api.polymarket.com/markets/${position.marketId}`);
          const market = await response.json();
          
          const currentPrice = position.outcome === 'YES' ? 
            parseFloat(JSON.parse(market.outcomePrices)[0]) : 
            (1 - parseFloat(JSON.parse(market.outcomePrices)[0]));
          
          const currentValue = position.shares * currentPrice;
          const profitLoss = currentValue - position.invested;
          const profitLossPercent = (profitLoss / position.invested) * 100;
          
          // Determine recommendation
          let recommendation = 'HOLD';
          if (profitLossPercent > 50) recommendation = 'SELL'; // Take profits
          if (profitLossPercent < -20) recommendation = 'URGENT_SELL'; // Cut losses
          if (profitLossPercent > 20 && profitLossPercent < 30) recommendation = 'HOLD'; // Let it run
          
          positions.push({
            marketId: position.marketId,
            marketQuestion: market.question,
            outcome: position.outcome,
            side: position.side,
            entryPrice: position.invested / position.shares,
            currentPrice,
            shares: position.shares,
            invested: position.invested,
            currentValue,
            profitLoss,
            profitLossPercent,
            recommendation
          });
          
          totalProfitLoss += profitLoss;
        } catch (error) {
          console.error(`Error fetching market ${position.marketId}:`, error);
        }
      }
      
      return {
        positions,
        totalProfitLoss,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error monitoring positions:', error);
      throw new Error(`Position monitoring failed: ${error.message}`);
    }
  }
});

/**
 * Auto Exit Tool
 * Automatically exits positions based on stop-loss and take-profit rules
 */
const autoExitTool = createTool({
  id: 'auto-exit',
  description: 'Automatically exits positions when stop-loss or take-profit thresholds are hit.',
  inputSchema: z.object({
    userId: z.string(),
    stopLossPercent: z.number().default(-15).describe('Exit if loss exceeds this % (negative number)'),
    takeProfitPercent: z.number().default(30).describe('Exit if profit exceeds this %'),
    dryRun: z.boolean().default(true)
  }),
  outputSchema: z.object({
    exitedPositions: z.array(z.object({
      marketId: z.string(),
      reason: z.string(),
      profitLoss: z.number(),
      action: z.string()
    })),
    totalExited: z.number(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    const { userId, stopLossPercent, takeProfitPercent, dryRun } = context;
    
    try {
      // Get current positions
      const positionData = await positionMonitorTool.execute({ 
        context: { userId } 
      });
      
      const exitedPositions = [];
      
      for (const position of positionData.positions) {
        let shouldExit = false;
        let reason = '';
        
        // Check stop-loss
        if (position.profitLossPercent <= stopLossPercent) {
          shouldExit = true;
          reason = `STOP-LOSS: Loss of ${position.profitLossPercent.toFixed(1)}% exceeds ${stopLossPercent}%`;
        }
        
        // Check take-profit
        if (position.profitLossPercent >= takeProfitPercent) {
          shouldExit = true;
          reason = `TAKE-PROFIT: Profit of ${position.profitLossPercent.toFixed(1)}% exceeds ${takeProfitPercent}%`;
        }
        
        if (shouldExit) {
          const action = dryRun ? 
            `Would sell ${position.shares.toFixed(2)} shares` : 
            `Selling ${position.shares.toFixed(2)} shares`;
          
          exitedPositions.push({
            marketId: position.marketId,
            reason,
            profitLoss: position.profitLoss,
            action
          });
          
          // TODO: Execute actual sell order if not dry-run
        }
      }
      
      return {
        exitedPositions,
        totalExited: exitedPositions.length,
        message: exitedPositions.length > 0 ? 
          `${exitedPositions.length} positions triggered exit rules` : 
          'No positions require exit'
      };
      
    } catch (error) {
      console.error('Error in auto-exit:', error);
      throw new Error(`Auto-exit failed: ${error.message}`);
    }
  }
});

/**
 * Live Trading Alert Tool
 * Sends alerts when significant events occur during live matches
 */
const liveTradingAlertTool = createTool({
  id: 'live-trading-alert',
  description: 'Monitors live matches and alerts when events occur that could affect open positions.',
  inputSchema: z.object({
    userId: z.string(),
    alertTypes: z.array(z.enum(['GOAL', 'RED_CARD', 'PRICE_MOVEMENT', 'STOP_LOSS'])).default(['GOAL', 'RED_CARD', 'PRICE_MOVEMENT'])
  }),
  outputSchema: z.object({
    alerts: z.array(z.object({
      type: z.string(),
      message: z.string(),
      marketId: z.string().optional(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      recommendation: z.string()
    })),
    timestamp: z.string()
  }),
  execute: async ({ context }) => {
    const { userId, alertTypes } = context;
    
    try {
      const alerts = [];
      
      // Get user positions
      const positionData = await positionMonitorTool.execute({ 
        context: { userId } 
      });
      
      // Get live matches
      const liveData = await liveMatchMonitorTool.execute({ 
        context: { includeEvents: true } 
      });
      
      // Check for alerts
      for (const position of positionData.positions) {
        // Price movement alerts
        if (alertTypes.includes('PRICE_MOVEMENT')) {
          if (position.profitLossPercent < -10) {
            alerts.push({
              type: 'PRICE_MOVEMENT',
              message: `Position losing ${Math.abs(position.profitLossPercent).toFixed(1)}%: ${position.marketQuestion}`,
              marketId: position.marketId,
              severity: position.profitLossPercent < -15 ? 'CRITICAL' : 'HIGH',
              recommendation: 'Consider exiting to limit losses'
            });
          }
          
          if (position.profitLossPercent > 25) {
            alerts.push({
              type: 'PRICE_MOVEMENT',
              message: `Position up ${position.profitLossPercent.toFixed(1)}%: ${position.marketQuestion}`,
              marketId: position.marketId,
              severity: 'MEDIUM',
              recommendation: 'Consider taking profits'
            });
          }
        }
        
        // Stop-loss alerts
        if (alertTypes.includes('STOP_LOSS') && position.recommendation === 'URGENT_SELL') {
          alerts.push({
            type: 'STOP_LOSS',
            message: `STOP-LOSS TRIGGERED: ${position.marketQuestion}`,
            marketId: position.marketId,
            severity: 'CRITICAL',
            recommendation: 'Exit position immediately'
          });
        }
      }
      
      // Live match event alerts
      for (const match of liveData.liveMatches) {
        if (match.events && alertTypes.includes('GOAL')) {
          const recentGoals = match.events.filter(e => e.type === 'GOAL' && match.minute - e.minute < 5);
          if (recentGoals.length > 0) {
            alerts.push({
              type: 'GOAL',
              message: `GOAL: ${match.homeTeam} ${match.score.home}-${match.score.away} ${match.awayTeam} (${match.minute}')`,
              severity: 'HIGH',
              recommendation: 'Check if this affects your positions'
            });
          }
        }
        
        if (match.events && alertTypes.includes('RED_CARD')) {
          const recentReds = match.events.filter(e => e.type === 'RED_CARD' && match.minute - e.minute < 5);
          if (recentReds.length > 0) {
            alerts.push({
              type: 'RED_CARD',
              message: `RED CARD: ${recentReds[0].player} (${recentReds[0].team}) - ${match.minute}'`,
              severity: 'CRITICAL',
              recommendation: 'Major impact on match outcome - review positions'
            });
          }
        }
      }
      
      return {
        alerts,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error generating alerts:', error);
      throw new Error(`Live trading alerts failed: ${error.message}`);
    }
  }
});

// Helper functions

function simulateLiveMatches(matchId, includeEvents) {
  // Simulated live match data
  // In production, fetch from API-Football or similar
  
  const matches = [
    {
      matchId: '672178',
      homeTeam: 'Newcastle',
      awayTeam: 'Manchester City',
      score: { home: 1, away: 2 },
      minute: 67,
      status: 'LIVE',
      events: includeEvents ? [
        { minute: 23, type: 'GOAL', team: 'Newcastle', player: 'Isak' },
        { minute: 45, type: 'GOAL', team: 'Manchester City', player: 'Haaland' },
        { minute: 58, type: 'GOAL', team: 'Manchester City', player: 'De Bruyne' },
        { minute: 62, type: 'YELLOW_CARD', team: 'Newcastle', player: 'Bruno' }
      ] : []
    },
    {
      matchId: '672158',
      homeTeam: 'Liverpool',
      awayTeam: 'Nottingham Forest',
      score: { home: 3, away: 0 },
      minute: 78,
      status: 'LIVE',
      events: includeEvents ? [
        { minute: 12, type: 'GOAL', team: 'Liverpool', player: 'Salah' },
        { minute: 34, type: 'GOAL', team: 'Liverpool', player: 'Nunez' },
        { minute: 56, type: 'GOAL', team: 'Liverpool', player: 'Salah' }
      ] : []
    }
  ];
  
  if (matchId) {
    return matches.filter(m => m.matchId === matchId);
  }
  
  return matches;
}

module.exports = {
  liveMatchMonitorTool,
  positionMonitorTool,
  autoExitTool,
  liveTradingAlertTool
};
