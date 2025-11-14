# ⚽ EPL Prediction Market Trading Agent

**Autonomous AI trading agent specialized for English Premier League markets on Polymarket**

Built with **Mastra AI** + **OpenAI GPT-4** + **Real-time Monitoring**

---

## 🎯 What It Does

Your AI agent:
- ✅ **Finds EPL markets** on Polymarket (200+ markets)
- ✅ **Analyzes teams** using form, odds, and head-to-head data
- ✅ **Executes trades** with proper risk management
- ✅ **Monitors live matches** and protects your capital
- ✅ **Auto-exits positions** with stop-loss and take-profit
- ✅ **Shorts markets** when they're overpriced
- ✅ **Manages your wallet** with full transaction tracking

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

### 3. Start the Agent
```bash
# Terminal 1: Start agent server
npm run start:agent

# Terminal 2: (Optional) Start data server
npm start
```

### 4. Create Wallet & Trade
```bash
# Initialize wallet with $1000
curl -X POST http://localhost:3001/api/wallet/initialize \
  -H "Content-Type: application/json" \
  -d '{"userId": "yourname", "initialBalance": 1000}'

# Scout for opportunities
curl http://localhost:3001/api/epl/scout

# Execute a trade
curl -X POST http://localhost:3001/api/epl/trade \
  -H "Content-Type: application/json" \
  -d '{"userId": "yourname", "homeTeam": "Arsenal", "awayTeam": "Man City", "maxAmount": 100}'
```

---

## 📊 Features

### 🤖 **11 AI Agents**

**EPL Specialists:**
1. **EPL Research Agent** - Deep team/match analysis
2. **EPL Trading Agent** - Executes trades with wallet management
3. **EPL Scout Agent** - Finds opportunities 24/7
4. **EPL Portfolio Agent** - Manages your portfolio
5. **Live Trading Agent** - Real-time match monitoring

**Supporting Agents:**
6. Trading Agent
7. Scanner Agent
8. Risk Manager Agent
9. Context-Aware Agent
10. Sentiment Analyst Agent
11. Research Agent

### 🛠️ **17 Specialized Tools**

**EPL Tools:**
- EPL Odds Analysis
- EPL Team Form
- EPL Head-to-Head
- EPL Market Finder
- EPL Value Bet Finder

**Wallet Tools:**
- Initialize Wallet
- Add Funds
- Get Balance
- Record Trade
- Transaction History

**Live Monitoring:**
- Live Match Monitor
- Position Monitor
- Auto-Exit
- Live Trading Alerts

**Plus:** Market Analysis, Trade Execution, Risk Management tools

### 💰 **Wallet System**
- Create wallets with initial balance
- Track all transactions
- Real-time P&L calculation
- Portfolio performance metrics

### 📈 **Live Trading**
- Monitor matches in real-time
- Auto-exit at stop-loss (-15%)
- Take profits automatically (+30%)
- Alerts for goals, red cards, price movements

### 🎯 **Risk Management**
- Maximum 5% per trade
- Kelly Criterion position sizing
- Stop-loss and take-profit
- Diversification tracking

---

## 📡 API Endpoints

### Wallet Management
```bash
POST /api/wallet/initialize      # Create wallet
POST /api/wallet/add-funds        # Add money
GET  /api/wallet/balance/:userId  # Check balance
```

### EPL Trading
```bash
POST /api/epl/research            # Research match/team
POST /api/epl/trade               # Execute trade
GET  /api/epl/scout               # Find opportunities
GET  /api/epl/portfolio/:userId   # Portfolio summary
```

### Live Monitoring
```bash
GET  /api/live/matches            # Live EPL matches
GET  /api/live/positions/:userId  # Monitor positions
POST /api/live/auto-exit          # Auto stop-loss/take-profit
GET  /api/live/alerts/:userId     # Live alerts
```

### Agent Control
```bash
POST /api/agent/chat              # Chat with any agent
POST /api/agent/scan-markets      # Scan all markets
POST /api/agent/execute-trade     # Execute specific trade
GET  /api/agent/status            # List all agents
```

---

## 📚 Documentation

- **[EPL-TRADING-GUIDE.md](./EPL-TRADING-GUIDE.md)** - Complete trading guide
- **[AGENT-EVALS-GUIDE.md](./AGENT-EVALS-GUIDE.md)** - Testing & validation
- **[FEATURES.md](./FEATURES.md)** - Detailed feature list
- **[QUICK-START-AGENT.md](./QUICK-START-AGENT.md)** - Quick start guide

---

## 🎓 Example Workflows

### Find & Execute Trade
```bash
# 1. Scout for opportunities
curl http://localhost:3001/api/epl/scout

# 2. Research specific match
curl -X POST http://localhost:3001/api/epl/research \
  -d '{"homeTeam": "Liverpool", "awayTeam": "Chelsea"}'

# 3. Execute trade
curl -X POST http://localhost:3001/api/epl/trade \
  -d '{"userId": "user123", "homeTeam": "Liverpool", "awayTeam": "Chelsea", "maxAmount": 50}'
```

### Monitor Live Match
```bash
# Enable auto-exit before match
curl -X POST http://localhost:3001/api/live/auto-exit \
  -d '{"userId": "user123", "stopLoss": -15, "takeProfit": 30}'

# Check live positions
curl http://localhost:3001/api/live/positions/user123

# Get alerts
curl http://localhost:3001/api/live/alerts/user123
```

### Short Overpriced Market
```bash
# Short Arsenal Top 4 (if you think 95.5% is too high)
curl -X POST http://localhost:3001/api/agent/execute-trade \
  -d '{"marketId": "582133", "outcome": "YES", "side": "SELL", "amount": 50}'
```

---

## 🧪 Testing & Validation

### Run Evaluations
```bash
# Run all tests
node run-evals.js run

# Run hallucination checks
node run-evals.js hallucination

# Continuous monitoring
node run-evals.js monitor 60
```

### Test Categories
- Wallet Management (2 tests)
- EPL Research (2 tests)
- Odds Analysis (1 test)
- Market Finding (1 test)
- Risk Management (1 test)
- Hallucination Prevention (3 tests)
- Tool Usage (1 test)
- Value Betting (1 test)

---

## 🔧 Configuration

### Required
```bash
OPENAI_API_KEY=your_openai_key_here
```

### Optional (for real trading)
```bash
POLYMARKET_API_KEY=your_key_here
POLYMARKET_SECRET=your_secret_here
POLYMARKET_PASSPHRASE=your_passphrase_here
```

### Optional (for live data)
```bash
API_FOOTBALL_KEY=your_key_here
THE_ODDS_API_KEY=your_key_here
```

---

## 📊 Available Markets

**200+ EPL Markets on Polymarket:**
- **League Winners** (20 markets) - Who wins the title?
- **Top 4 Finish** (20 markets) - Champions League qualification
- **Relegation** (20 markets) - Who gets relegated?
- **Match Results** (24 markets) - Specific game outcomes
- **Other Props** (116+ markets) - Various EPL bets

---

## 🛡️ Safety Features

- ✅ **Dry-run mode** by default (no real money)
- ✅ **Position limits** (max 5% per trade)
- ✅ **Stop-loss** protection (-15% default)
- ✅ **Take-profit** automation (+30% default)
- ✅ **Risk validation** before every trade
- ✅ **Hallucination prevention** with evals
- ✅ **Transaction logging** for all trades

---

## 🎯 Roadmap

### ✅ Completed
- EPL market integration
- Wallet management
- Live match monitoring
- Auto stop-loss/take-profit
- Shorting capability
- Evaluation system

### 🚧 In Progress
- Real-time live data APIs
- Advanced portfolio analytics
- Multi-user support

### 📋 Planned
- Mobile dashboard
- Telegram/Discord alerts
- Advanced ML models
- Multi-league support

---

## 🤝 Contributing

This is a personal trading agent. Use at your own risk.

---

## ⚠️ Disclaimer

**This is experimental software for educational purposes.**

- Prediction markets involve risk
- Past performance doesn't guarantee future results
- Only trade what you can afford to lose
- Ensure prediction markets are legal in your jurisdiction
- No guarantees of profit

---

## 📞 Support

- **Documentation:** See `/docs` folder
- **Issues:** Check existing issues first
- **Questions:** Review documentation

---

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ using Mastra AI Framework**

🤖 11 Agents | 🛠️ 17 Tools | ⚽ 200+ EPL Markets | 💰 Full Wallet System | 📊 Live Monitoring
