# ⚽ EPL Prediction Market Trading System

## Overview

Your autonomous trading agent is now **specialized for English Premier League (EPL) prediction markets**. The system combines AI agents, betting odds analysis, team form research, and wallet management to make profitable EPL trades on Polymarket.

## 🎯 System Architecture

### 10 AI Agents (4 EPL-Specialized)

**EPL Specialist Agents:**
1. **EPL Research Agent** - Deep analysis of teams, matches, and betting markets
2. **EPL Trading Agent** - Executes trades with wallet management
3. **EPL Scout Agent** - Continuously monitors for opportunities
4. **EPL Portfolio Agent** - Manages overall EPL trading portfolio

**Supporting Agents:**
5. Trading Agent - General market trading
6. Scanner Agent - Market scanning
7. Risk Manager Agent - Risk management
8. Context-Aware Agent - Sentiment + news trading
9. Sentiment Analyst Agent - Public sentiment analysis
10. Research Agent - Multi-source research

### 17 Specialized Tools

**EPL Tools (5):**
- EPL Odds Analysis - Compare bookmaker odds
- EPL Team Form - Analyze recent performance
- EPL Head-to-Head - Historical matchup analysis
- EPL Market Finder - Find EPL markets on Polymarket
- EPL Value Bet Finder - Identify mispriced markets

**Wallet Tools (5):**
- Initialize Wallet - Create user wallet
- Add Funds - Deposit money
- Get Balance - Check available funds
- Record Trade - Log transactions
- Transaction History - View past trades

**Trading Tools (7):**
- Market Analysis, Scan Markets, Place Trade, Validate Trade, Kelly Criterion, Portfolio Risk, Sentiment Analysis

## 💰 Wallet System

### Initialize Your Wallet

```bash
curl -X POST http://localhost:3001/api/wallet/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "initialBalance": 1000
  }'
```

### Add Funds

```bash
curl -X POST http://localhost:3001/api/wallet/add-funds \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "amount": 500
  }'
```

### Check Balance

```bash
curl http://localhost:3001/api/wallet/balance/user123
```

## ⚽ EPL Trading Workflows

### 1. Research a Match

Get deep analysis on an upcoming EPL match:

```bash
curl -X POST http://localhost:3001/api/epl/research \
  -H "Content-Type: application/json" \
  -d '{
    "homeTeam": "Arsenal",
    "awayTeam": "Manchester City"
  }'
```

**What the agent analyzes:**
- Recent form (last 5-10 games)
- Goals scored/conceded
- Clean sheets
- Injury news
- Head-to-head history
- Current betting odds
- Polymarket markets
- Value opportunities

### 2. Execute EPL Trade

Full trading workflow with research + execution:

```bash
curl -X POST http://localhost:3001/api/epl/trade \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "homeTeam": "Arsenal",
    "awayTeam": "Manchester City",
    "maxAmount": 100
  }'
```

**Trading workflow:**
1. Check wallet balance
2. Research both teams
3. Analyze odds and form
4. Find Polymarket markets
5. Calculate optimal bet size
6. Validate risk criteria
7. Execute trade (dry-run)
8. Record transaction

### 3. Scout for Opportunities

Let the scout agent find the best EPL opportunities:

```bash
curl 'http://localhost:3001/api/epl/scout?minEdge=5'
```

**Scout finds:**
- All EPL markets on Polymarket
- Current betting odds
- Value bets with 5%+ edge
- Breaking news/sentiment shifts
- Ranked list of opportunities

### 4. Portfolio Management

Get comprehensive portfolio analysis:

```bash
curl http://localhost:3001/api/epl/portfolio/user123
```

**Portfolio includes:**
- Current balance
- Transaction history
- Open positions
- Performance metrics (ROI, win rate)
- Diversification score
- Recommendations

## 🎯 Trading Strategies

### Strategy 1: Form-Based Trading
**Concept:** Back teams in excellent form against struggling opponents

**Example:**
- Arsenal: WWWWW (5 wins in a row)
- Opponent: LLLLD (poor form)
- **Action:** BUY YES on Arsenal win

### Strategy 2: Odds Arbitrage
**Concept:** Find discrepancies between bookmaker odds and Polymarket probabilities

**Example:**
- Bookmaker odds: Arsenal 2.5 (40% implied probability)
- Polymarket: Arsenal 30% probability
- **Edge:** 10% in favor of Arsenal
- **Action:** BUY YES on Arsenal

### Strategy 3: Head-to-Head Dominance
**Concept:** Back teams with strong historical records

**Example:**
- Liverpool vs Everton
- Last 10 meetings: Liverpool 8 wins, 2 draws, 0 losses
- **Action:** BUY YES on Liverpool win

### Strategy 4: Home Advantage
**Concept:** Strong home teams are often undervalued

**Example:**
- Newcastle at home: 80% win rate
- Market probability: 60%
- **Edge:** 20%
- **Action:** BUY YES on Newcastle

### Strategy 5: Injury Impact
**Concept:** Key player injuries create value

**Example:**
- Man City without Haaland
- Bookmakers adjust odds, Polymarket lags
- **Action:** BUY NO on Man City high-scoring

## 📊 Risk Management

### Position Sizing Rules
- **Maximum per trade:** 5% of wallet
- **Minimum edge required:** 5%
- **Kelly Criterion:** Used for optimal sizing
- **Diversification:** Max 20% in any single match

### Risk Limits
- Stop trading if wallet drops below 20% of starting balance
- Maximum 3 trades per day
- Require 60%+ confidence for trades
- Always validate trades before execution

## 🔧 Integration with Betting APIs

### Recommended APIs (To Implement)

**1. The Odds API**
- URL: https://the-odds-api.com/
- Features: Real-time odds from 40+ bookmakers
- Cost: Free tier available

**2. API-Football**
- URL: https://www.api-football.com/
- Features: Live scores, stats, lineups, injuries
- Cost: Free tier: 100 requests/day

**3. Football-Data.org**
- URL: https://www.football-data.org/
- Features: Fixtures, results, standings
- Cost: Free tier available

### Implementation Steps

1. **Get API Keys:**
```bash
# Add to .env file
THE_ODDS_API_KEY=your_key_here
API_FOOTBALL_KEY=your_key_here
```

2. **Update EPL Tools:**
Replace simulated data in `src/mastra/tools/epl-tools.js` with real API calls

3. **Example Integration:**
```javascript
// In eplOddsAnalysisTool
const response = await fetch(
  `https://api.the-odds-api.com/v4/sports/soccer_epl/odds?apiKey=${process.env.THE_ODDS_API_KEY}`
);
const odds = await response.json();
```

## 📈 Example Trading Session

### Complete Workflow

```bash
# 1. Initialize wallet with $1000
curl -X POST http://localhost:3001/api/wallet/initialize \
  -d '{"userId": "john", "initialBalance": 1000}'

# 2. Scout for opportunities
curl http://localhost:3001/api/epl/scout

# 3. Research top opportunity (Arsenal vs Man City)
curl -X POST http://localhost:3001/api/epl/research \
  -d '{"homeTeam": "Arsenal", "awayTeam": "Manchester City"}'

# 4. Execute trade
curl -X POST http://localhost:3001/api/epl/trade \
  -d '{"userId": "john", "homeTeam": "Arsenal", "awayTeam": "Manchester City", "maxAmount": 50}'

# 5. Check portfolio
curl http://localhost:3001/api/epl/portfolio/john

# 6. Check balance
curl http://localhost:3001/api/wallet/balance/john
```

## 🎓 Learning from the Agent

### What Makes a Good EPL Trade?

**The agent considers:**
1. **Form Analysis** - Recent results matter
2. **Odds Value** - Edge over bookmakers
3. **Historical Data** - Head-to-head trends
4. **Injuries** - Key player availability
5. **Home Advantage** - Significant in EPL
6. **Motivation** - League position, European spots
7. **Schedule** - Fixture congestion affects performance

### Common Pitfalls to Avoid

❌ **Don't:**
- Trade without research
- Bet more than 5% per trade
- Ignore injury news
- Chase losses
- Trade on emotion

✅ **Do:**
- Always check team form
- Compare multiple odds sources
- Use Kelly Criterion for sizing
- Diversify across matches
- Keep detailed records

## 🚀 Next Steps

### 1. Test the System
```bash
# Start with small amounts
curl -X POST http://localhost:3001/api/wallet/initialize \
  -d '{"userId": "test_user", "initialBalance": 100}'
```

### 2. Integrate Real APIs
- Sign up for The Odds API
- Get API-Football key
- Update epl-tools.js with real data

### 3. Build Custom Dashboard
- Use the EPL dashboard template
- Add real-time updates
- Visualize performance

### 4. Refine Strategies
- Track which strategies work best
- Adjust risk parameters
- Learn from wins and losses

## 📞 API Reference

### Wallet Endpoints
- `POST /api/wallet/initialize` - Create wallet
- `POST /api/wallet/add-funds` - Add money
- `GET /api/wallet/balance/:userId` - Check balance

### EPL Endpoints
- `POST /api/epl/research` - Research match/team
- `POST /api/epl/trade` - Execute EPL trade
- `GET /api/epl/scout` - Find opportunities
- `GET /api/epl/portfolio/:userId` - Portfolio summary

### Agent Endpoints
- `GET /api/agent/status` - List all agents
- `POST /api/agent/chat` - Chat with any agent

## 🎯 Success Metrics

Track these KPIs:
- **ROI (Return on Investment):** Target 10-20%
- **Win Rate:** Target 55-60%
- **Average Edge:** Target 7-10%
- **Sharpe Ratio:** Measure risk-adjusted returns
- **Max Drawdown:** Keep under 20%

## ⚠️ Important Notes

1. **Dry-Run Mode:** Currently enabled - no real money at risk
2. **Simulated Data:** Replace with real APIs for production
3. **Risk Warning:** Prediction markets involve risk - never bet more than you can afford to lose
4. **Legal:** Ensure prediction market trading is legal in your jurisdiction

---

**Your EPL trading system is ready!** Start with research, test strategies, and gradually scale up as you gain confidence. The AI agents will handle the heavy lifting - you just need to fund your wallet and let them work! ⚽💰
