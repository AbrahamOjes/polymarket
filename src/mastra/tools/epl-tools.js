/**
 * EPL (English Premier League) Trading Tools
 * Specialized tools for analyzing EPL markets and making informed predictions
 */

const { createTool } = require('@mastra/core/tools');
const { z } = require('zod');

/**
 * EPL Odds Analysis Tool
 * Fetches and analyzes betting odds from multiple bookmakers
 */
const eplOddsAnalysisTool = createTool({
  id: 'epl-odds-analysis',
  description: 'Analyzes betting odds from multiple bookmakers for EPL matches. Identifies value bets and market inefficiencies.',
  inputSchema: z.object({
    team: z.string().optional().describe('Specific team to analyze'),
    matchday: z.string().optional().describe('Specific matchday or "next" for upcoming matches'),
    market: z.enum(['match_result', 'over_under', 'both_teams_score', 'all']).default('all')
  }),
  outputSchema: z.object({
    matches: z.array(z.object({
      homeTeam: z.string(),
      awayTeam: z.string(),
      date: z.string(),
      odds: z.object({
        home: z.number(),
        draw: z.number(),
        away: z.number()
      }),
      impliedProbability: z.object({
        home: z.number(),
        draw: z.number(),
        away: z.number()
      }),
      bookmakerConsensus: z.string(),
      valueOpportunity: z.boolean()
    })),
    analysis: z.string()
  }),
  execute: async ({ context }) => {
    const { team, matchday, market } = context;
    
    try {
      // NOTE: In production, integrate with:
      // - The Odds API (https://the-odds-api.com/)
      // - API-Football (https://www.api-football.com/)
      // - Football-Data.org API
      
      // Simulated EPL odds data
      const matches = await simulateEPLOdds(team, matchday);
      
      // Calculate implied probabilities and find value
      const analyzedMatches = matches.map(match => {
        const total = (1/match.odds.home) + (1/match.odds.draw) + (1/match.odds.away);
        
        return {
          ...match,
          impliedProbability: {
            home: ((1/match.odds.home) / total * 100).toFixed(2),
            draw: ((1/match.odds.draw) / total * 100).toFixed(2),
            away: ((1/match.odds.away) / total * 100).toFixed(2)
          },
          bookmakerConsensus: match.odds.home < match.odds.away ? 'HOME_FAVORED' : 
                              match.odds.away < match.odds.home ? 'AWAY_FAVORED' : 'BALANCED',
          valueOpportunity: Math.max(match.odds.home, match.odds.draw, match.odds.away) > 3.5
        };
      });
      
      const analysis = generateOddsAnalysis(analyzedMatches);
      
      return {
        matches: analyzedMatches,
        analysis
      };
      
    } catch (error) {
      console.error('Error analyzing EPL odds:', error);
      throw new Error(`EPL odds analysis failed: ${error.message}`);
    }
  }
});

/**
 * EPL Team Form Analysis Tool
 * Analyzes recent team performance, injuries, and form
 */
const eplTeamFormTool = createTool({
  id: 'epl-team-form',
  description: 'Analyzes EPL team form including recent results, goals scored/conceded, injuries, and momentum.',
  inputSchema: z.object({
    team: z.string().describe('Team name (e.g., "Arsenal", "Manchester City")'),
    lastNGames: z.number().default(5).describe('Number of recent games to analyze')
  }),
  outputSchema: z.object({
    team: z.string(),
    form: z.string().describe('Recent form (e.g., "WWDLW")'),
    points: z.number(),
    goalsScored: z.number(),
    goalsConceded: z.number(),
    cleanSheets: z.number(),
    injuries: z.array(z.object({
      player: z.string(),
      position: z.string(),
      severity: z.enum(['minor', 'moderate', 'major'])
    })),
    momentum: z.enum(['STRONG_POSITIVE', 'POSITIVE', 'NEUTRAL', 'NEGATIVE', 'STRONG_NEGATIVE']),
    analysis: z.string()
  }),
  execute: async ({ context }) => {
    const { team, lastNGames } = context;
    
    try {
      // NOTE: In production, integrate with:
      // - API-Football for live stats
      // - Premier League official API
      // - Injury tracking APIs
      
      const formData = await simulateTeamForm(team, lastNGames);
      
      return formData;
      
    } catch (error) {
      console.error('Error analyzing team form:', error);
      throw new Error(`Team form analysis failed: ${error.message}`);
    }
  }
});

/**
 * EPL Head-to-Head Analysis Tool
 * Analyzes historical matchups between two teams
 */
const eplHeadToHeadTool = createTool({
  id: 'epl-head-to-head',
  description: 'Analyzes historical head-to-head records between two EPL teams.',
  inputSchema: z.object({
    homeTeam: z.string(),
    awayTeam: z.string(),
    lastNMeetings: z.number().default(10)
  }),
  outputSchema: z.object({
    homeTeam: z.string(),
    awayTeam: z.string(),
    totalMeetings: z.number(),
    homeWins: z.number(),
    draws: z.number(),
    awayWins: z.number(),
    averageGoals: z.number(),
    recentTrend: z.string(),
    analysis: z.string()
  }),
  execute: async ({ context }) => {
    const { homeTeam, awayTeam, lastNMeetings } = context;
    
    try {
      const h2hData = await simulateHeadToHead(homeTeam, awayTeam, lastNMeetings);
      
      return h2hData;
      
    } catch (error) {
      console.error('Error analyzing head-to-head:', error);
      throw new Error(`Head-to-head analysis failed: ${error.message}`);
    }
  }
});

/**
 * EPL Market Finder Tool
 * Finds relevant EPL markets on Polymarket
 */
const eplMarketFinderTool = createTool({
  id: 'epl-market-finder',
  description: 'Finds EPL-related prediction markets on Polymarket.',
  inputSchema: z.object({
    query: z.string().optional().describe('Search query (team name, competition, etc.)'),
    marketType: z.enum(['match_winner', 'top_scorer', 'relegation', 'champion', 'top_four', 'all']).default('all')
  }),
  outputSchema: z.object({
    markets: z.array(z.object({
      id: z.string(),
      question: z.string(),
      probability: z.number(),
      volume: z.number(),
      liquidity: z.number(),
      marketType: z.string()
    })),
    totalFound: z.number()
  }),
  execute: async ({ context }) => {
    const { query, marketType } = context;
    
    try {
      // Fetch EPL markets directly from Polymarket using EPL tag (ID: 306)
      const response = await fetch('https://gamma-api.polymarket.com/markets?tag_id=306&limit=200&closed=false');
      if (!response.ok) {
        throw new Error(`Failed to fetch EPL markets: ${response.statusText}`);
      }
      
      const eplMarkets = await response.json();
      
      // Parse and format markets
      const formattedMarkets = eplMarkets.map(market => {
        let probability = 0.5;
        try {
          const prices = typeof market.outcomePrices === 'string' ? 
            JSON.parse(market.outcomePrices) : market.outcomePrices;
          probability = parseFloat(prices?.[0]) || 0.5;
        } catch (e) {
          probability = 0.5;
        }
        
        return {
          id: market.id,
          question: market.question,
          probability: probability * 100,
          volume: market.volumeClob || 0,
          liquidity: market.liquidityClob || 0,
          marketType: categorizeMarket(market.question)
        };
      });
      
      return {
        markets: formattedMarkets,
        totalFound: formattedMarkets.length
      };
      
    } catch (error) {
      console.error('Error finding EPL markets:', error);
      throw new Error(`EPL market finder failed: ${error.message}`);
    }
  }
});

/**
 * EPL Value Bet Finder Tool
 * Compares bookmaker odds with Polymarket probabilities to find value
 */
const eplValueBetFinderTool = createTool({
  id: 'epl-value-bet-finder',
  description: 'Finds value betting opportunities by comparing bookmaker odds with Polymarket probabilities.',
  inputSchema: z.object({
    minEdge: z.number().default(5).describe('Minimum edge percentage to consider'),
    minVolume: z.number().default(1000).describe('Minimum market volume')
  }),
  outputSchema: z.object({
    valueBets: z.array(z.object({
      market: z.string(),
      marketId: z.string(),
      polymarketProbability: z.number(),
      bookmakerOdds: z.number(),
      impliedProbability: z.number(),
      edge: z.number(),
      recommendation: z.string(),
      confidence: z.number()
    })),
    totalOpportunities: z.number()
  }),
  execute: async ({ context }) => {
    const { minEdge, minVolume } = context;
    
    try {
      // Get EPL markets
      const eplMarkets = await eplMarketFinderTool.execute({ context: { marketType: 'all' } });
      
      // Get odds data
      const oddsData = await eplOddsAnalysisTool.execute({ context: {} });
      
      // Find value bets
      const valueBets = [];
      
      for (const market of eplMarkets.markets) {
        if (market.volume < minVolume) continue;
        
        // Match with odds data
        const matchingOdds = findMatchingOdds(market, oddsData.matches);
        
        if (matchingOdds) {
          const impliedProb = (1 / matchingOdds) * 100;
          const edge = market.probability - impliedProb;
          
          if (Math.abs(edge) >= minEdge) {
            valueBets.push({
              market: market.question,
              marketId: market.id,
              polymarketProbability: market.probability,
              bookmakerOdds: matchingOdds,
              impliedProbability: impliedProb,
              edge: edge,
              recommendation: edge > 0 ? 'BUY_YES' : 'BUY_NO',
              confidence: Math.min(95, 60 + Math.abs(edge))
            });
          }
        }
      }
      
      // Sort by edge
      valueBets.sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));
      
      return {
        valueBets: valueBets.slice(0, 10),
        totalOpportunities: valueBets.length
      };
      
    } catch (error) {
      console.error('Error finding value bets:', error);
      throw new Error(`Value bet finder failed: ${error.message}`);
    }
  }
});

// Helper functions

function simulateEPLOdds(team, matchday) {
  // Simulated upcoming EPL matches with odds
  const matches = [
    {
      homeTeam: 'Arsenal',
      awayTeam: 'Manchester City',
      date: '2025-11-16',
      odds: { home: 2.8, draw: 3.4, away: 2.5 }
    },
    {
      homeTeam: 'Liverpool',
      awayTeam: 'Chelsea',
      date: '2025-11-16',
      odds: { home: 2.1, draw: 3.6, away: 3.4 }
    },
    {
      homeTeam: 'Manchester United',
      awayTeam: 'Tottenham',
      date: '2025-11-17',
      odds: { home: 2.6, draw: 3.3, away: 2.8 }
    },
    {
      homeTeam: 'Newcastle',
      awayTeam: 'Brighton',
      date: '2025-11-17',
      odds: { home: 2.3, draw: 3.5, away: 3.1 }
    },
    {
      homeTeam: 'Aston Villa',
      awayTeam: 'West Ham',
      date: '2025-11-17',
      odds: { home: 2.0, draw: 3.4, away: 3.8 }
    }
  ];
  
  if (team) {
    return matches.filter(m => 
      m.homeTeam.toLowerCase().includes(team.toLowerCase()) ||
      m.awayTeam.toLowerCase().includes(team.toLowerCase())
    );
  }
  
  return matches;
}

function simulateTeamForm(team, lastNGames) {
  // Simulated team form data
  const formExamples = {
    'Arsenal': {
      form: 'WWDWW',
      points: 13,
      goalsScored: 12,
      goalsConceded: 3,
      cleanSheets: 3,
      injuries: [
        { player: 'Gabriel Jesus', position: 'Forward', severity: 'minor' }
      ],
      momentum: 'STRONG_POSITIVE',
      analysis: 'Arsenal in excellent form with 4 wins in last 5 games. Strong defensively with 3 clean sheets. Minor injury concerns but squad depth is good.'
    },
    'Manchester City': {
      form: 'WWWDW',
      points: 13,
      goalsScored: 15,
      goalsConceded: 4,
      cleanSheets: 2,
      injuries: [],
      momentum: 'STRONG_POSITIVE',
      analysis: 'Manchester City dominant with 4 wins in 5. Averaging 3 goals per game. No injury concerns. Peak form.'
    }
  };
  
  return formExamples[team] || {
    team,
    form: 'WDLWD',
    points: 8,
    goalsScored: 6,
    goalsConceded: 6,
    cleanSheets: 1,
    injuries: [],
    momentum: 'NEUTRAL',
    analysis: `${team} showing mixed form with 2 wins, 2 draws, 1 loss in last 5 games.`
  };
}

function simulateHeadToHead(homeTeam, awayTeam, lastNMeetings) {
  return {
    homeTeam,
    awayTeam,
    totalMeetings: lastNMeetings,
    homeWins: 4,
    draws: 3,
    awayWins: 3,
    averageGoals: 2.8,
    recentTrend: 'Evenly matched with recent meetings being high-scoring',
    analysis: `Historical matchup shows competitive fixtures. ${homeTeam} has slight home advantage with 4 wins vs 3 losses. Expect goals with 2.8 average per game.`
  };
}

function generateOddsAnalysis(matches) {
  const valueMatches = matches.filter(m => m.valueOpportunity);
  
  return `Analyzed ${matches.length} EPL matches. Found ${valueMatches.length} potential value opportunities. 
  
Key insights:
- Bookmakers showing consensus on ${matches.filter(m => m.bookmakerConsensus !== 'BALANCED').length} matches
- ${valueMatches.length} matches have odds > 3.5 indicating potential upsets
- Average implied probability margin: ${(matches.reduce((sum, m) => sum + parseFloat(m.impliedProbability.home), 0) / matches.length).toFixed(1)}%`;
}

function categorizeMarket(question) {
  const q = question.toLowerCase();
  if (q.includes('win') || q.includes('beat') || q.includes('defeat')) return 'match_winner';
  if (q.includes('top scorer') || q.includes('golden boot')) return 'top_scorer';
  if (q.includes('relegate') || q.includes('bottom')) return 'relegation';
  if (q.includes('champion') || q.includes('title') || q.includes('win the league')) return 'champion';
  if (q.includes('top 4') || q.includes('top four') || q.includes('champions league')) return 'top_four';
  return 'other';
}

function findMatchingOdds(market, oddsMatches) {
  // Simple matching logic - in production, use more sophisticated matching
  for (const match of oddsMatches) {
    if (market.question.toLowerCase().includes(match.homeTeam.toLowerCase()) ||
        market.question.toLowerCase().includes(match.awayTeam.toLowerCase())) {
      return match.odds.home; // Simplified - would need better logic
    }
  }
  return null;
}

module.exports = {
  eplOddsAnalysisTool,
  eplTeamFormTool,
  eplHeadToHeadTool,
  eplMarketFinderTool,
  eplValueBetFinderTool
};
