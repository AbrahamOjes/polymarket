# 🧠 Context-Aware Trading with Mastra

## Overview

Your trading agent now has **real-world context awareness** through integration with Twitter/X, news sources, and trend analysis. This enables the agent to make more informed trading decisions by understanding public sentiment and current events.

## 🆕 New Capabilities

### 1. **Twitter/X Sentiment Analysis**
- Analyze public sentiment for any topic
- Track trending conversations
- Measure sentiment intensity and confidence
- Identify sentiment shifts over time

### 2. **News Aggregation**
- Fetch and analyze recent news articles
- Assess news sentiment and market implications
- Track breaking news that could affect markets
- Aggregate multiple news sources

### 3. **Sentiment-Market Matching**
- Automatically match sentiment data to relevant Polymarket markets
- Calculate relevance scores
- Determine if sentiment supports YES or NO outcomes
- Identify mispriced markets based on sentiment

### 4. **Trend Analysis**
- Identify trending topics across social media
- Analyze trend strength and momentum
- Find markets related to trending topics
- Spot emerging opportunities early

## 🤖 New Agents

### Context-Aware Trading Agent
**Name:** `contextAwareAgent`

**Purpose:** Main agent that combines market data with real-world context

**Capabilities:**
- Full trading workflow with context awareness
- Sentiment-driven market analysis
- News-informed decision making
- Trend-based opportunity identification

**Example Usage:**
```bash
curl -X POST http://localhost:3001/api/agent/context-trade \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Federal Reserve",
    "maxTrades": 3,
    "dryRun": true
  }'
```

### Sentiment Analyst Agent
**Name:** `sentimentAnalystAgent`

**Purpose:** Specialized in analyzing sentiment and matching to markets

**Capabilities:**
- Twitter sentiment analysis
- News sentiment analysis
- Sentiment-market matching
- Confidence scoring

**Example Usage:**
```bash
curl -X POST http://localhost:3001/api/agent/sentiment-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Bitcoin ETF",
    "includeNews": true
  }'
```

### Research Agent
**Name:** `researchAgent`

**Purpose:** Comprehensive research before trading decisions

**Capabilities:**
- Multi-source information gathering
- Synthesis and analysis
- Bull vs Bear case analysis
- Risk identification

**Example Usage:**
```bash
curl http://localhost:3001/api/agent/trends?category=crypto
```

## 🛠️ New Tools

### 1. Twitter Sentiment Tool
```javascript
{
  id: 'twitter-sentiment',
  inputs: {
    query: string,        // Topic to analyze
    timeframe: '1h' | '6h' | '24h' | '7d'
  },
  outputs: {
    sentimentScore: number,    // -1 to 1
    tweetVolume: number,
    topKeywords: string[],
    sentiment: 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE' | 'VERY_POSITIVE',
    confidence: number,
    insights: string,
    trendingUp: boolean
  }
}
```

### 2. News Aggregation Tool
```javascript
{
  id: 'news-aggregation',
  inputs: {
    topic: string,
    sources: string[],  // Optional
    limit: number
  },
  outputs: {
    articles: Article[],
    overallSentiment: 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE',
    marketImplications: string,
    confidence: number
  }
}
```

### 3. Sentiment-Market Matcher Tool
```javascript
{
  id: 'sentiment-market-matcher',
  inputs: {
    topic: string,
    sentimentScore: number,
    keywords: string[]
  },
  outputs: {
    matchedMarkets: Market[],
    totalMatches: number
  }
}
```

### 4. Trend Analysis Tool
```javascript
{
  id: 'trend-analysis',
  inputs: {
    category: 'all' | 'politics' | 'crypto' | 'sports' | 'finance'
  },
  outputs: {
    trends: Trend[],
    timestamp: string
  }
}
```

## 📡 New API Endpoints

### POST /api/agent/sentiment-analysis
Analyze sentiment for a topic and find related markets

**Request:**
```json
{
  "topic": "Federal Reserve",
  "includeNews": true
}
```

**Response:**
```json
{
  "topic": "Federal Reserve",
  "analysis": "Detailed sentiment analysis and market recommendations...",
  "timestamp": "2025-11-14T03:00:00.000Z"
}
```

### POST /api/agent/context-trade
Execute context-aware trading workflow

**Request:**
```json
{
  "topic": "Bitcoin ETF",
  "maxTrades": 3,
  "dryRun": true
}
```

**Response:**
```json
{
  "topic": "Bitcoin ETF",
  "maxTrades": 3,
  "dryRun": true,
  "result": "Complete trading analysis with sentiment context...",
  "timestamp": "2025-11-14T03:00:00.000Z"
}
```

### GET /api/agent/trends
Get trending topics and opportunities

**Request:**
```
GET /api/agent/trends?category=crypto
```

**Response:**
```json
{
  "category": "crypto",
  "analysis": "Trending topics analysis and recommendations...",
  "timestamp": "2025-11-14T03:00:00.000Z"
}
```

## 🎯 Trading Strategies with Context

### Strategy 1: Sentiment-Driven Trading
1. Identify topic with strong sentiment
2. Analyze Twitter + news sentiment
3. Find markets related to topic
4. Compare sentiment to market probability
5. Trade if significant mismatch exists

**Example:**
- Topic: "Federal Reserve rate cut"
- Twitter sentiment: Very negative (-0.7)
- Market probability: 85% (YES on rate cut)
- **Opportunity:** BUY NO (sentiment suggests rate cut unlikely)

### Strategy 2: News-Event Trading
1. Monitor breaking news
2. Analyze market implications
3. Find affected markets quickly
4. Trade before market adjusts

**Example:**
- News: "Fed announces unexpected policy change"
- Immediate sentiment shift
- Markets haven't adjusted yet
- **Opportunity:** Quick trade before repricing

### Strategy 3: Trend-Following
1. Identify trending topics
2. Find related markets
3. Ride the momentum
4. Exit when trend reverses

**Example:**
- Trend: "Bitcoin ETF approval" trending up
- Sentiment: Very positive
- Markets: Crypto-related markets
- **Opportunity:** BUY YES on crypto markets

### Strategy 4: Contrarian Trading
1. Find extreme sentiment
2. Check if market has overreacted
3. Take opposite position
4. Wait for reversion to mean

**Example:**
- Sentiment: Panic selling (very negative)
- Market: Overpriced NO position
- **Opportunity:** BUY YES (contrarian bet)

## 🔧 Implementation Status

### ✅ Currently Working:
- Agent framework with context tools
- Sentiment analysis structure
- Market matching logic
- API endpoints
- Multi-agent coordination

### ⚠️ Needs Real Implementation:
- **Twitter API Integration** - Requires Twitter API v2 credentials
- **News API Integration** - Requires News API key or RSS feeds
- **Sentiment Analysis** - Currently simulated, needs real NLP
- **Trend Data** - Needs Google Trends or Twitter Trends API

## 🚀 Next Steps to Make It Real

### 1. Twitter/X Integration
```bash
# Get Twitter API credentials from: https://developer.twitter.com
# Add to .env:
TWITTER_BEARER_TOKEN=your_token_here
```

Then update `context-tools.js` to use real Twitter API:
```javascript
const response = await fetch('https://api.twitter.com/2/tweets/search/recent', {
  headers: {
    'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
  },
  params: {
    query: query,
    max_results: 100
  }
});
```

### 2. News API Integration
```bash
# Get News API key from: https://newsapi.org
# Add to .env:
NEWS_API_KEY=your_key_here
```

### 3. Sentiment Analysis
Install sentiment analysis library:
```bash
npm install sentiment natural
```

### 4. Google Trends (Optional)
```bash
npm install google-trends-api
```

## 💡 Example Workflows

### Workflow 1: Find Opportunities by Topic
```bash
# 1. Analyze sentiment
curl -X POST http://localhost:3001/api/agent/sentiment-analysis \
  -d '{"topic": "Trump 2024"}'

# 2. Execute context-aware trades
curl -X POST http://localhost:3001/api/agent/context-trade \
  -d '{"topic": "Trump 2024", "maxTrades": 5}'
```

### Workflow 2: Trend-Based Trading
```bash
# 1. Get trending topics
curl http://localhost:3001/api/agent/trends?category=politics

# 2. Analyze top trend
curl -X POST http://localhost:3001/api/agent/sentiment-analysis \
  -d '{"topic": "[trending topic]"}'

# 3. Execute trades
curl -X POST http://localhost:3001/api/agent/context-trade \
  -d '{"topic": "[trending topic]"}'
```

### Workflow 3: Research-Driven Trading
```bash
# Use research agent for comprehensive analysis
curl -X POST http://localhost:3001/api/agent/chat \
  -d '{
    "message": "Research Federal Reserve policy and find trading opportunities",
    "agentName": "researchAgent"
  }'
```

## 📊 Benefits of Context-Aware Trading

1. **Better Information** - Access to real-time public sentiment
2. **Early Detection** - Spot opportunities before markets adjust
3. **Informed Decisions** - Combine multiple data sources
4. **Risk Awareness** - Understand sentiment-driven risks
5. **Competitive Edge** - Use information others might miss

## ⚠️ Important Warnings

1. **Sentiment Can Be Misleading**
   - Echo chambers and filter bubbles
   - Bot manipulation
   - Not representative of all opinions

2. **Timing Matters**
   - Markets may have already priced in sentiment
   - Sentiment can change quickly
   - Lag between sentiment and market adjustment

3. **Correlation ≠ Causation**
   - Positive sentiment doesn't guarantee positive outcome
   - Markets can be irrational
   - Other factors matter too

4. **API Limits and Costs**
   - Twitter API has rate limits
   - News APIs may have costs
   - Need to implement caching

## 🎓 Learn More

- [Mastra Documentation](https://mastra.ai/docs)
- [Twitter API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)
- [News API Documentation](https://newsapi.org/docs)
- [Sentiment Analysis Guide](https://en.wikipedia.org/wiki/Sentiment_analysis)

---

**Your trading agent is now context-aware!** Start by testing with simulated data, then integrate real APIs for production use.
