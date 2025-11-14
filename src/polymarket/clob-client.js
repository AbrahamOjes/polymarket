/**
 * Polymarket CLOB API Client
 * Authenticated client to access real Polymarket markets and place orders
 */

const fetch = require('node-fetch');
const crypto = require('crypto');

class PolymarketCLOBClient {
  constructor(apiKey, secret, passphrase) {
    this.apiKey = apiKey;
    this.secret = secret;
    this.passphrase = passphrase;
    this.baseUrl = process.env.CLOB_API_BASE || 'https://clob.polymarket.com';
  }

  /**
   * Generate authentication headers for CLOB API
   */
  generateAuthHeaders(method, path, body = '') {
    const timestamp = Date.now().toString();
    const message = timestamp + method + path + (body ? JSON.stringify(body) : '');
    
    const signature = crypto
      .createHmac('sha256', Buffer.from(this.secret, 'base64'))
      .update(message)
      .digest('base64');

    return {
      'POLY-ADDRESS': this.apiKey,
      'POLY-SIGNATURE': signature,
      'POLY-TIMESTAMP': timestamp,
      'POLY-PASSPHRASE': this.passphrase,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make authenticated request to CLOB API
   */
  async request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path, body);

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
      }
      
      return data;
    } catch (error) {
      console.error('CLOB API Request failed:', error);
      throw error;
    }
  }

  /**
   * Get all active markets
   */
  async getMarkets() {
    try {
      // Use public API for market discovery
      const response = await fetch('https://gamma-api.polymarket.com/markets?closed=false&limit=1000');
      const markets = await response.json();
      return markets;
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      return [];
    }
  }

  /**
   * Get EPL-specific markets
   */
  async getEPLMarkets() {
    const allMarkets = await this.getMarkets();
    
    const eplKeywords = [
      'premier league', 'epl', 'arsenal', 'liverpool', 'chelsea', 
      'manchester city', 'manchester united', 'tottenham', 'newcastle',
      'brighton', 'aston villa', 'west ham', 'everton', 'leicester',
      'wolves', 'fulham', 'brentford', 'crystal palace', 'bournemouth',
      'nottingham forest', 'luton', 'burnley', 'sheffield'
    ];

    return allMarkets.filter(market => {
      const question = market.question?.toLowerCase() || '';
      const description = market.description?.toLowerCase() || '';
      return eplKeywords.some(keyword => 
        question.includes(keyword) || description.includes(keyword)
      );
    });
  }

  /**
   * Get market details by ID
   */
  async getMarket(marketId) {
    try {
      const response = await fetch(`https://gamma-api.polymarket.com/markets/${marketId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch market:', error);
      return null;
    }
  }

  /**
   * Get order book for a market
   */
  async getOrderBook(tokenId) {
    return await this.request('GET', `/book?token_id=${tokenId}`);
  }

  /**
   * Get current price for a market outcome
   */
  async getPrice(tokenId) {
    try {
      const orderBook = await this.getOrderBook(tokenId);
      
      if (orderBook && orderBook.bids && orderBook.bids.length > 0) {
        return {
          bid: parseFloat(orderBook.bids[0].price),
          ask: orderBook.asks && orderBook.asks.length > 0 ? parseFloat(orderBook.asks[0].price) : null,
          mid: orderBook.asks && orderBook.asks.length > 0 
            ? (parseFloat(orderBook.bids[0].price) + parseFloat(orderBook.asks[0].price)) / 2
            : parseFloat(orderBook.bids[0].price)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get price:', error);
      return null;
    }
  }

  /**
   * Place an order
   */
  async placeOrder(order) {
    return await this.request('POST', '/order', order);
  }

  /**
   * Get user's open orders
   */
  async getOpenOrders() {
    return await this.request('GET', '/orders');
  }

  /**
   * Get user's positions
   */
  async getPositions() {
    return await this.request('GET', '/positions');
  }

  /**
   * Get user's balance
   */
  async getBalance() {
    return await this.request('GET', '/balance');
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId) {
    return await this.request('DELETE', `/order/${orderId}`);
  }

  /**
   * Get trade history
   */
  async getTradeHistory(marketId = null) {
    const path = marketId ? `/trades?market=${marketId}` : '/trades';
    return await this.request('GET', path);
  }
}

module.exports = { PolymarketCLOBClient };
