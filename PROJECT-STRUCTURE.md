# 📁 EPL Trading Agent - Project Structure

## Core Files

```
├── agent-server.js              # Main EPL trading server (Port 3001)
├── run-evals.js                 # Agent evaluation runner
├── package.json                 # Dependencies
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Example environment config
└── README.md                    # Main documentation
```

## Source Code

```
src/
└── mastra/
    ├── index.js                 # Mastra configuration (11 agents)
    │
    ├── agents/
    │   ├── epl-agents.js        # EPL specialist agents (4)
    │   │   ├── eplResearchAgent
    │   │   ├── eplTradingAgent
    │   │   ├── eplScoutAgent
    │   │   └── eplPortfolioAgent
    │   │
    │   └── live-trading-agent.js # Live monitoring agent (1)
    │       └── liveTradingAgent
    │
    ├── tools/
    │   ├── epl-tools.js         # EPL analysis tools (5)
    │   │   ├── eplOddsAnalysisTool
    │   │   ├── eplTeamFormTool
    │   │   ├── eplHeadToHeadTool
    │   │   ├── eplMarketFinderTool
    │   │   └── eplValueBetFinderTool
    │   │
    │   ├── wallet-tools.js      # Wallet management (5)
    │   │   ├── initializeWalletTool
    │   │   ├── addFundsTool
    │   │   ├── getBalanceTool
    │   │   ├── recordTradeTool
    │   │   └── getTransactionHistoryTool
    │   │
    │   ├── live-monitoring-tools.js  # Real-time monitoring (4)
    │   │   ├── liveMatchMonitorTool
    │   │   ├── positionMonitorTool
    │   │   ├── autoExitTool
    │   │   └── liveTradingAlertTool
    │   │
    │   ├── market-analysis.tool.js   # Market analysis (2)
    │   │   ├── analyzeMarketTool
    │   │   └── scanMarketsTool
    │   │
    │   ├── trade-execution.tool.js   # Trade execution (3)
    │   │   ├── placeTradeTool
    │   │   ├── getPositionsTool
    │   │   └── cancelOrderTool
    │   │
    │   └── risk-management.tool.js   # Risk management (3)
    │       ├── validateTradeTool
    │       ├── checkPortfolioRiskTool
    │       └── calculateKellyCriterionTool
    │
    └── evals/
        └── epl-agent-evals.js   # Evaluation test suite (12 tests)
```

## Data

```
data/
└── wallets.json                 # User wallet data (gitignored)
```

## Documentation

```
├── README.md                    # Main README
├── EPL-TRADING-GUIDE.md         # Complete trading guide
├── AGENT-EVALS-GUIDE.md         # Evaluation & testing guide
├── FEATURES.md                  # Feature list
├── QUICK-START-AGENT.md         # Quick start guide
└── PROJECT-STRUCTURE.md         # This file
```

## Archive

```
archive/
├── old-ui/                      # Old HTML dashboards
├── old-docs/                    # Old documentation
└── old-servers/                 # Old server files
```

---

## Agent Summary

### Total: 11 AI Agents

**EPL Specialists (4):**
1. EPL Research Agent - Deep analysis
2. EPL Trading Agent - Trade execution
3. EPL Scout Agent - Opportunity finding
4. EPL Portfolio Agent - Portfolio management

**Live Trading (1):**
5. Live Trading Agent - Real-time monitoring

**Supporting (6):**
6. Trading Agent - General trading
7. Scanner Agent - Market scanning
8. Risk Manager Agent - Risk management
9. Context-Aware Agent - Sentiment trading
10. Sentiment Analyst Agent - Sentiment analysis
11. Research Agent - Multi-source research

---

## Tool Summary

### Total: 17 Specialized Tools

**EPL Tools (5):**
- Odds Analysis
- Team Form
- Head-to-Head
- Market Finder
- Value Bet Finder

**Wallet Tools (5):**
- Initialize Wallet
- Add Funds
- Get Balance
- Record Trade
- Transaction History

**Live Monitoring (4):**
- Live Match Monitor
- Position Monitor
- Auto-Exit
- Live Trading Alerts

**Trading Tools (3):**
- Market Analysis
- Scan Markets
- Place Trade (BUY/SELL)

---

## API Endpoints

### Wallet Management (3)
- `POST /api/wallet/initialize`
- `POST /api/wallet/add-funds`
- `GET /api/wallet/balance/:userId`

### EPL Trading (4)
- `POST /api/epl/research`
- `POST /api/epl/trade`
- `GET /api/epl/scout`
- `GET /api/epl/portfolio/:userId`

### Live Monitoring (4)
- `GET /api/live/matches`
- `GET /api/live/positions/:userId`
- `POST /api/live/auto-exit`
- `GET /api/live/alerts/:userId`

### Agent Control (6)
- `POST /api/agent/chat`
- `POST /api/agent/scan-markets`
- `POST /api/agent/analyze-market`
- `POST /api/agent/execute-trade`
- `GET /api/agent/portfolio`
- `GET /api/agent/status`

**Total: 17 API Endpoints**

---

## Dependencies

### Core
- `@mastra/core` - AI agent framework
- `@ai-sdk/openai` - OpenAI integration
- `express` - Web server
- `zod` - Schema validation

### Optional
- `@goat-sdk/plugin-polymarket` - Polymarket SDK (for real trading)
- `dotenv` - Environment variables
- `cors` - CORS support

---

## Environment Variables

### Required
```bash
OPENAI_API_KEY=sk-...           # OpenAI API key
```

### Optional (Real Trading)
```bash
POLYMARKET_API_KEY=...          # Polymarket credentials
POLYMARKET_SECRET=...
POLYMARKET_PASSPHRASE=...
```

### Optional (Live Data)
```bash
API_FOOTBALL_KEY=...            # Live match data
THE_ODDS_API_KEY=...            # Betting odds
```

---

## Ports

- **3001** - Agent Server (Main)
- **3000** - Data Server (Optional)

---

## Data Flow

```
User Request
    ↓
Agent Server (3001)
    ↓
Mastra AI (11 Agents)
    ↓
Tools (17 Tools)
    ↓
External APIs
    ├── Polymarket (Markets)
    ├── OpenAI (AI)
    ├── API-Football (Live Data)
    └── The Odds API (Odds)
    ↓
Response to User
```

---

## File Sizes

```
agent-server.js          ~23 KB
src/mastra/agents/       ~15 KB
src/mastra/tools/        ~45 KB
src/mastra/evals/        ~12 KB
Documentation            ~50 KB
```

**Total Source Code: ~95 KB**

---

## Clean & Focused ✨

This structure contains **only EPL trading functionality**. All non-essential files have been archived.

**Focus:** EPL Prediction Markets on Polymarket
**Purpose:** Autonomous AI Trading with Capital Protection
**Status:** Production Ready (Dry-Run Mode)
