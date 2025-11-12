/**
 * Backend Server using Polymarket SDK
 * Official SDK integration for reliable data fetching
 */

const express = require('express');
const cors = require('cors');
const { polymarket } = require('@goat-sdk/plugin-polymarket');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize Polymarket SDK with full credentials
const polymarketClient = polymarket({
  credentials: {
    key: process.env.POLYMARKET_API_KEY,
    secret: process.env.POLYMARKET_SECRET,
    passphrase: process.env.POLYMARKET_PASSPHRASE
  }
});

/**
 * GET /api/markets
 * Fetch all markets using SDK
 */
app.get('/api/markets', async (req, res) => {
  try {
    const { limit = 50, active = true } = req.query;
    
    // Use SDK to fetch markets
    const markets = await polymarketClient.getMarkets({
      limit: parseInt(limit),
      active: active === 'true'
    });
    
    res.json(markets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ 
      error: 'Failed to fetch markets',
      message: error.message 
    });
  }
});

/**
 * GET /api/markets/sports
 * Fetch sports-specific markets using SDK
 */
app.get('/api/markets/sports', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    // Fetch all markets
    const allMarkets = await polymarketClient.getMarkets({
      limit: parseInt(limit),
      active: true
    });
    
    // Filter for sports markets
    const sportsKeywords = [
      'sport', 'football', 'basketball', 'soccer', 'baseball', 
      'mma', 'boxing', 'nfl', 'nba', 'mlb', 'nhl', 'ufc',
      'premier league', 'champions league', 'world cup',
      'super bowl', 'playoffs', 'finals', 'tennis', 'golf',
      'formula 1', 'f1', 'nascar', 'cricket', 'rugby'
    ];
    
    const sportsMarkets = allMarkets.filter(market => {
      const question = (market.question || '').toLowerCase();
      const description = (market.description || '').toLowerCase();
      const tags = market.tags || [];
      
      return sportsKeywords.some(keyword => 
        question.includes(keyword) ||
        description.includes(keyword) ||
        tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    });
    
    console.log(`Found ${sportsMarkets.length} sports markets out of ${allMarkets.length} total`);
    res.json(sportsMarkets);
  } catch (error) {
    console.error('Error fetching sports markets:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sports markets',
      message: error.message 
    });
  }
});

/**
 * GET /api/markets/:id
 * Fetch specific market details using SDK
 */
app.get('/api/markets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const market = await polymarketClient.getMarket(id);
    res.json(market);
  } catch (error) {
    console.error('Error fetching market details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market details',
      message: error.message 
    });
  }
});

/**
 * GET /api/search
 * Search markets using SDK
 */
app.get('/api/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const markets = await polymarketClient.searchMarkets({
      query: q,
      limit: parseInt(limit)
    });
    
    res.json(markets);
  } catch (error) {
    console.error('Error searching markets:', error);
    res.status(500).json({ 
      error: 'Failed to search markets',
      message: error.message 
    });
  }
});

/**
 * GET /api/market/:id/prices
 * Get current prices for a market
 */
app.get('/api/market/:id/prices', async (req, res) => {
  try {
    const { id } = req.params;
    
    const prices = await polymarketClient.getMarketPrices(id);
    res.json(prices);
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market prices',
      message: error.message 
    });
  }
});

/**
 * GET /api/trending
 * Get trending markets
 */
app.get('/api/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const trending = await polymarketClient.getTrendingMarkets({
      limit: parseInt(limit)
    });
    
    res.json(trending);
  } catch (error) {
    console.error('Error fetching trending markets:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trending markets',
      message: error.message 
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    sdk: '@goat-sdk/plugin-polymarket',
    apiKeyConfigured: !!process.env.POLYMARKET_API_KEY
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
  console.log(`\n🚀 Polymarket Server (SDK) running on http://localhost:${PORT}`);
  console.log(`📦 Using: @goat-sdk/plugin-polymarket`);
  console.log(`🔑 API Key: ${process.env.POLYMARKET_API_KEY ? 'Configured ✓' : 'Not configured'}`);
  console.log(`\n📍 Available Endpoints:`);
  console.log(`   GET /api/markets - Fetch all markets`);
  console.log(`   GET /api/markets/sports - Fetch sports markets`);
  console.log(`   GET /api/markets/:id - Fetch market details`);
  console.log(`   GET /api/market/:id/prices - Get market prices`);
  console.log(`   GET /api/search?q=query - Search markets`);
  console.log(`   GET /api/trending - Get trending markets`);
  console.log(`   GET /api/health - Health check`);
  console.log(`\n✨ Ready to serve live Polymarket data!\n`);
});

module.exports = app;
