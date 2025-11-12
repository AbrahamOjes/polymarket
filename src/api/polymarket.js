/**
 * Polymarket API Integration
 * Fetches real market data from Polymarket
 * Documentation: https://docs.polymarket.com/
 */

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';
const CLOB_API_BASE = 'https://clob.polymarket.com';

/**
 * Fetch markets by category
 * @param {string} category - Category slug (e.g., 'sports')
 * @param {number} limit - Number of markets to fetch
 * @returns {Promise<Array>} Array of market objects
 */
async function fetchMarketsByCategory(category = 'sports', limit = 10) {
  try {
    const response = await fetch(
      `${POLYMARKET_API_BASE}/markets?limit=${limit}&active=true&closed=false`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const markets = await response.json();
    
    // Filter by category if specified
    if (category) {
      return markets.filter(market => 
        market.tags?.some(tag => 
          tag.toLowerCase().includes(category.toLowerCase())
        )
      );
    }
    
    return markets;
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
}

/**
 * Fetch specific market details
 * @param {string} conditionId - Market condition ID
 * @returns {Promise<Object>} Market details
 */
async function fetchMarketDetails(conditionId) {
  try {
    const response = await fetch(
      `${POLYMARKET_API_BASE}/markets/${conditionId}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching market details:', error);
    return null;
  }
}

/**
 * Fetch order book for a market
 * @param {string} tokenId - Token ID for the market
 * @returns {Promise<Object>} Order book data
 */
async function fetchOrderBook(tokenId) {
  try {
    const response = await fetch(
      `${CLOB_API_BASE}/book?token_id=${tokenId}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching order book:', error);
    return null;
  }
}

/**
 * Transform Polymarket data to our UI format
 * @param {Object} market - Raw market data from Polymarket
 * @returns {Object} Formatted market data
 */
function transformMarketData(market) {
  // Calculate probability from outcome prices
  const yesPrice = parseFloat(market.outcomePrices?.[0] || 0);
  const probability = Math.round(yesPrice * 100);
  
  // Determine probability level for color coding
  let probabilityLevel = 'low';
  if (probability > 60) probabilityLevel = 'high';
  else if (probability >= 40) probabilityLevel = 'medium';
  
  // Format volume
  const volume = parseFloat(market.volume || 0);
  const formattedVolume = volume >= 1000000 
    ? `$${(volume / 1000000).toFixed(1)}M`
    : volume >= 1000
    ? `$${(volume / 1000).toFixed(1)}K`
    : `$${volume.toFixed(0)}`;
  
  // Get category/sport type
  const category = market.tags?.[0] || 'SPORTS';
  const categoryIcon = getCategoryIcon(category);
  
  return {
    id: market.conditionId,
    question: market.question,
    category: category.toUpperCase(),
    categoryIcon: categoryIcon,
    probability: probability,
    probabilityLevel: probabilityLevel,
    probabilityLabel: getProbabilityLabel(probability),
    volume: formattedVolume,
    volumeRaw: volume,
    traders: market.numTraders || 0,
    status: market.closed ? 'closed' : 'live',
    endDate: market.endDate,
    description: market.description,
    outcomes: market.outcomes || ['YES', 'NO'],
    outcomePrices: market.outcomePrices || [],
    liquidity: market.liquidity || 0,
    // Market intelligence (if available)
    intelligence: extractIntelligence(market)
  };
}

/**
 * Get category icon emoji
 * @param {string} category - Category name
 * @returns {string} Emoji icon
 */
function getCategoryIcon(category) {
  const icons = {
    'sports': '⚽',
    'football': '🏈',
    'basketball': '🏀',
    'baseball': '⚾',
    'soccer': '⚽',
    'tennis': '🎾',
    'hockey': '🏒',
    'mma': '🥊',
    'boxing': '🥊',
    'cricket': '🏏',
    'politics': '🏛️',
    'crypto': '₿',
    'tech': '💻',
    'entertainment': '🎬',
    'business': '💼'
  };
  
  const lowerCategory = category.toLowerCase();
  for (const [key, icon] of Object.entries(icons)) {
    if (lowerCategory.includes(key)) {
      return icon;
    }
  }
  
  return '⚽'; // Default to sports
}

/**
 * Get probability label based on percentage
 * @param {number} probability - Probability percentage
 * @returns {string} Label text
 */
function getProbabilityLabel(probability) {
  if (probability >= 80) return 'very likely YES';
  if (probability >= 60) return 'likely YES';
  if (probability >= 40) return 'uncertain';
  if (probability >= 20) return 'likely NO';
  return 'very likely NO';
}

/**
 * Extract intelligence/reasoning from market data
 * @param {Object} market - Market data
 * @returns {Array} Intelligence points
 */
function extractIntelligence(market) {
  const intelligence = [];
  
  // Add volume-based insight
  if (market.volume > 1000000) {
    intelligence.push({
      icon: '💰',
      text: `High trading volume ($${(market.volume / 1000000).toFixed(1)}M) indicates strong market confidence`
    });
  }
  
  // Add trader count insight
  if (market.numTraders > 1000) {
    intelligence.push({
      icon: '👥',
      text: `${market.numTraders.toLocaleString()} forecasters have made predictions`
    });
  }
  
  // Add liquidity insight
  if (market.liquidity > 100000) {
    intelligence.push({
      icon: '💧',
      text: 'High liquidity ensures competitive pricing'
    });
  }
  
  // Parse description for insights (if available)
  if (market.description) {
    const sentences = market.description.split('.').filter(s => s.trim().length > 20);
    sentences.slice(0, 2).forEach(sentence => {
      intelligence.push({
        icon: '📊',
        text: sentence.trim()
      });
    });
  }
  
  return intelligence.slice(0, 3); // Limit to 3 points
}

/**
 * Fetch and format sports markets
 * @param {number} limit - Number of markets to fetch
 * @returns {Promise<Array>} Formatted sports markets
 */
async function fetchSportsMarkets(limit = 10) {
  try {
    const markets = await fetchMarketsByCategory('sports', limit);
    return markets.map(transformMarketData);
  } catch (error) {
    console.error('Error fetching sports markets:', error);
    return [];
  }
}

/**
 * Search markets by query
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Matching markets
 */
async function searchMarkets(query, limit = 10) {
  try {
    const response = await fetch(
      `${POLYMARKET_API_BASE}/markets?limit=${limit}&active=true&closed=false`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const markets = await response.json();
    
    // Filter by query
    const filtered = markets.filter(market =>
      market.question.toLowerCase().includes(query.toLowerCase()) ||
      market.description?.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.map(transformMarketData);
  } catch (error) {
    console.error('Error searching markets:', error);
    return [];
  }
}

// Export functions
export {
  fetchMarketsByCategory,
  fetchMarketDetails,
  fetchOrderBook,
  fetchSportsMarkets,
  searchMarkets,
  transformMarketData
};
