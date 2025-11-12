/**
 * Backend Server for Polymarket API
 * Direct API integration with proper authentication
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Polymarket API configuration
const GAMMA_API = 'https://gamma-api.polymarket.com';
const CLOB_API = 'https://clob.polymarket.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

/**
 * Create authentication headers for Polymarket API
 */
function createAuthHeaders(method, path, body = '') {
  const timestamp = Date.now().toString();
  const message = timestamp + method + path + body;
  
  const signature = crypto
    .createHmac('sha256', process.env.POLYMARKET_SECRET)
    .update(message)
    .digest('base64');
  
  return {
    'POLY-ADDRESS': process.env.POLYMARKET_API_KEY,
    'POLY-SIGNATURE': signature,
    'POLY-TIMESTAMP': timestamp,
    'POLY-PASSPHRASE': process.env.POLYMARKET_PASSPHRASE,
    'Content-Type': 'application/json'
  };
}

/**
 * GET /api/markets
 * Fetch all markets
 */
app.get('/api/markets', async (req, res) => {
  try {
    const { limit = 50, active = 'true', closed = 'false' } = req.query;
    
    const url = `${GAMMA_API}/markets?limit=${limit}&active=${active}&closed=${closed}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const markets = await response.json();
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
    const { limit = 200 } = req.query;
    
    // Fetch more markets to find sports ones
    const url = `${GAMMA_API}/markets?limit=${limit}&active=true&closed=false`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const markets = await response.json();
    
    // Expanded sports keywords for better filtering
    const sportsKeywords = [
      // General
      'sport', 'game', 'match', 'tournament', 'championship', 'league',
      // Football
      'football', 'nfl', 'super bowl', 'quarterback', 'touchdown',
      // Basketball
      'basketball', 'nba', 'lakers', 'celtics', 'warriors', 'lebron', 'curry',
      // Soccer
      'soccer', 'premier league', 'champions league', 'world cup', 'fifa', 
      'messi', 'ronaldo', 'uefa', 'la liga', 'bundesliga',
      // Baseball
      'baseball', 'mlb', 'world series', 'yankees', 'dodgers',
      // Combat sports
      'mma', 'ufc', 'boxing', 'fight', 'fighter', 'knockout',
      // Other sports
      'tennis', 'golf', 'formula 1', 'f1', 'nascar', 'cricket', 'rugby', 
      'hockey', 'nhl', 'olympics', 'wimbledon', 'masters',
      // Teams/Events
      'team', 'player', 'win', 'lose', 'score', 'playoff'
    ];
    
    const sportsMarkets = markets.filter(market => {
      const question = (market.question || '').toLowerCase();
      const description = (market.description || '').toLowerCase();
      const tags = market.tags || [];
      const slug = (market.slug || '').toLowerCase();
      
      // Check all text fields
      const allText = `${question} ${description} ${slug} ${tags.join(' ')}`.toLowerCase();
      
      return sportsKeywords.some(keyword => allText.includes(keyword));
    });
    
    console.log(`✅ Found ${sportsMarkets.length} sports markets out of ${markets.length} total`);
    
    // If no sports markets found, log some examples
    if (sportsMarkets.length === 0) {
      console.log('📋 Sample market questions:');
      markets.slice(0, 5).forEach((m, i) => {
        console.log(`  ${i+1}. ${m.question.substring(0, 60)}...`);
      });
    }
    
    res.json(sportsMarkets);
  } catch (error) {
    console.error('❌ Error fetching sports markets:', error);
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
    
    const url = `${GAMMA_API}/markets/${id}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
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
 * GET /api/search
 * Search markets by query
 */
app.get('/api/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const url = `${GAMMA_API}/markets?limit=100&active=true&closed=false`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
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
    api: 'Polymarket Gamma API',
    credentials: {
      apiKey: !!process.env.POLYMARKET_API_KEY,
      secret: !!process.env.POLYMARKET_SECRET,
      passphrase: !!process.env.POLYMARKET_PASSPHRASE
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Polymarket Server running on http://localhost:${PORT}`);
  console.log(`📊 API: Gamma API (gamma-api.polymarket.com)`);
  console.log(`🔑 Credentials: ${process.env.POLYMARKET_API_KEY ? 'Configured ✓' : 'Missing'}`);
  console.log(`\n📍 Available Endpoints:`);
  console.log(`   GET /api/markets - Fetch all markets`);
  console.log(`   GET /api/markets/sports - Fetch sports markets`);
  console.log(`   GET /api/markets/:id - Fetch market details`);
  console.log(`   GET /api/search?q=query - Search markets`);
  console.log(`   GET /api/health - Health check`);
  console.log(`\n✨ Ready to serve live Polymarket data!\n`);
});

module.exports = app;
