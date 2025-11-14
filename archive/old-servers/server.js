/**
 * Backend Proxy Server for Polymarket API
 * Handles CORS and API authentication
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Polymarket API configuration
const POLYMARKET_API_BASE = process.env.POLYMARKET_API_BASE || 'https://gamma-api.polymarket.com';
const CLOB_API_BASE = process.env.CLOB_API_BASE || 'https://clob.polymarket.com';
const API_KEY = process.env.POLYMARKET_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

/**
 * GET /api/markets
 * Fetch all markets with optional filters
 */
app.get('/api/markets', async (req, res) => {
  try {
    const { limit = 50, active = 'true', closed = 'false', category } = req.query;
    
    const url = `${POLYMARKET_API_BASE}/markets?limit=${limit}&active=${active}&closed=${closed}`;
    
    const headers = {};
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }
    
    let markets = await response.json();
    
    // Filter by category if specified
    if (category) {
      markets = markets.filter(market => 
        market.tags?.some(tag => 
          tag.toLowerCase().includes(category.toLowerCase())
        )
      );
    }
    
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
 * Fetch sports-specific markets
 */
app.get('/api/markets/sports', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const url = `${POLYMARKET_API_BASE}/markets?limit=${limit}&active=true&closed=false`;
    
    const headers = {};
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }
    
    const markets = await response.json();
    
    // Filter for sports markets
    const sportsKeywords = [
      'sport', 'football', 'basketball', 'soccer', 'baseball', 
      'mma', 'boxing', 'nfl', 'nba', 'mlb', 'nhl', 'ufc',
      'premier league', 'champions league', 'world cup',
      'super bowl', 'playoffs', 'finals'
    ];
    
    const sportsMarkets = markets.filter(market => {
      const tags = market.tags || [];
      const question = market.question.toLowerCase();
      const description = (market.description || '').toLowerCase();
      
      return sportsKeywords.some(keyword => 
        tags.some(tag => tag.toLowerCase().includes(keyword)) ||
        question.includes(keyword) ||
        description.includes(keyword)
      );
    });
    
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
 * Fetch specific market details
 */
app.get('/api/markets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const url = `${POLYMARKET_API_BASE}/markets/${id}`;
    
    const headers = {};
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }
    
    const market = await response.json();
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
 * GET /api/orderbook/:tokenId
 * Fetch order book for a market
 */
app.get('/api/orderbook/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const url = `${CLOB_API_BASE}/book?token_id=${tokenId}`;
    
    const headers = {};
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CLOB API error: ${response.status}`);
    }
    
    const orderBook = await response.json();
    res.json(orderBook);
  } catch (error) {
    console.error('Error fetching order book:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order book',
      message: error.message 
    });
  }
});

/**
 * GET /api/search
 * Search markets by query
 */
app.get('/api/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const url = `${POLYMARKET_API_BASE}/markets?limit=100&active=true&closed=false`;
    
    const headers = {};
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }
    
    const markets = await response.json();
    
    // Filter by search query
    const query = q.toLowerCase();
    const filtered = markets.filter(market =>
      market.question.toLowerCase().includes(query) ||
      market.description?.toLowerCase().includes(query) ||
      market.tags?.some(tag => tag.toLowerCase().includes(query))
    );
    
    res.json(filtered.slice(0, limit));
  } catch (error) {
    console.error('Error searching markets:', error);
    res.status(500).json({ 
      error: 'Failed to search markets',
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
    polymarketApi: POLYMARKET_API_BASE,
    apiKeyConfigured: !!API_KEY
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Polymarket Proxy Server running on http://localhost:${PORT}`);
  console.log(`📊 API Base: ${POLYMARKET_API_BASE}`);
  console.log(`🔑 API Key: ${API_KEY ? 'Configured' : 'Not configured (using public endpoints)'}`);
  console.log(`\n📍 Endpoints:`);
  console.log(`   GET /api/markets - Fetch all markets`);
  console.log(`   GET /api/markets/sports - Fetch sports markets`);
  console.log(`   GET /api/markets/:id - Fetch market details`);
  console.log(`   GET /api/search?q=query - Search markets`);
  console.log(`   GET /api/health - Health check`);
});

module.exports = app;
