# 🤖 Polymarket Autonomous Trading Agent

An AI-powered autonomous trading agent for Polymarket prediction markets, built with [Mastra AI Framework](https://mastra.ai).

## 🌟 Features

### 3 Specialized AI Agents

1. **Trading Agent** - Main autonomous trading agent
   - Analyzes markets and identifies opportunities
   - Executes trades with risk management
   - Makes data-driven decisions using AI

2. **Scanner Agent** - Market opportunity finder
   - Continuously scans markets for mispriced opportunities
   - Identifies high-volume, high-liquidity markets
   - Ranks opportunities by confidence × potential return

3. **Risk Manager Agent** - Portfolio risk specialist
   - Validates trades against risk criteria
   - Calculates optimal position sizes using Kelly Criterion
   - Monitors portfolio diversification and exposure

### 8 Powerful Tools

**Market Analysis:**
- `analyzeMarketTool` - Deep analysis of specific markets
- `scanMarketsTool` - Scan multiple markets for opportunities

**Trade Execution:**
- `placeTradeTool` - Execute trades (with dry-run mode)
- `getPositionsTool` - View current positions
- `cancelOrderTool` - Cancel open orders

**Risk Management:**
- `validateTradeTool` - Validate trades against risk criteria
- `checkPortfolioRiskTool` - Analyze portfolio risk
- `calculateKellyCriterionTool` - Calculate optimal bet sizing

## 🚀 Quick Start

### Prerequisites

1. **Node.js 20+** installed
2. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Polymarket Credentials** - Get from [Polymarket](https://polymarket.com)

### Installation

```bash
# Install dependencies (if not already done)
npm install

# The following packages are required:
# - @mastra/core
# - @ai-sdk/openai
# - zod
# - ai
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your API keys to `.env`:
```env
# OpenAI API Key (REQUIRED for agent)
OPENAI_API_KEY=your_openai_api_key_here

# Polymarket Credentials (REQUIRED for live trading)
POLYMARKET_API_KEY=your_api_key_here
POLYMARKET_SECRET=your_secret_here
POLYMARKET_PASSPHRASE=your_passphrase_here

# Agent Server Port (optional)
AGENT_PORT=3001
```

### Running the Agent

1. **Start the Polymarket data server** (required):
```bash
npm start
# Runs on http://localhost:3000
```

2. **Start the agent server** (in a new terminal):
```bash
npm run start:agent
# Runs on http://localhost:3001
```

3. **Open the dashboard**:
```bash
open agent-dashboard.html
# Or visit: http://localhost:3001 in your browser
```

## 📊 Usage Examples

### 1. Chat with the Agent

Ask the agent anything about markets or trading:

```bash
curl -X POST http://localhost:3001/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the best trading opportunities right now?"}'
```

### 2. Scan Markets for Opportunities

```bash
curl -X POST http://localhost:3001/api/agent/scan-markets \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 20,
    "minVolume": 10000,
    "category": "sports"
  }'
```

### 3. Analyze a Specific Market

```bash
curl -X POST http://localhost:3001/api/agent/analyze-market \
  -H "Content-Type: application/json" \
  -d '{"marketId": "0x1234..."}'
```

### 4. Execute a Trade (Dry Run)

```bash
curl -X POST http://localhost:3001/api/agent/execute-trade \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": "0x1234...",
    "outcome": "YES",
    "amount": 100,
    "dryRun": true
  }'
```

### 5. Autonomous Trading Session

Let the agent autonomously find and execute trades:

```bash
curl -X POST http://localhost:3001/api/agent/auto-trade \
  -H "Content-Type: application/json" \
  -d '{
    "maxTrades": 3,
    "maxAmountPerTrade": 100,
    "dryRun": true
  }'
```

### 6. Portfolio Analysis

```bash
curl http://localhost:3001/api/agent/portfolio
```

## 🛡️ Safety Features

### Dry Run Mode (Default)

All trades execute in **dry-run mode by default**. No real money is spent unless you explicitly set `dryRun: false`.

### Risk Management

- **Maximum single trade:** $1,000
- **High risk markets:** Max $200
- **Medium risk markets:** Max $500
- **Minimum confidence:** 60%
- **Kelly Criterion:** Uses quarter-Kelly (0.25) for conservative sizing

### Position Limits

- Max 10% of portfolio per trade
- Max 30% exposure per category
- Minimum 5 uncorrelated positions for diversification

## 🎯 Trading Strategy

The agent follows a systematic approach:

1. **Market Scanning**
   - Scans high-volume, high-liquidity markets
   - Identifies probability extremes (<30% or >70%)
   - Filters by resolution clarity

2. **Analysis**
   - Calculates fair value probability
   - Compares to market probability (edge detection)
   - Assesses risk level and confidence

3. **Position Sizing**
   - Uses Kelly Criterion for optimal sizing
   - Applies quarter-Kelly fraction for safety
   - Adjusts for risk level

4. **Validation**
   - Checks against risk limits
   - Validates portfolio constraints
   - Requires minimum confidence threshold

5. **Execution**
   - Places orders at favorable prices
   - Monitors for fills
   - Tracks P&L

## 📡 API Endpoints

### Agent Endpoints

- `POST /api/agent/chat` - Chat with trading agent
- `POST /api/agent/scan-markets` - Scan for opportunities
- `POST /api/agent/analyze-market` - Analyze specific market
- `POST /api/agent/execute-trade` - Execute a trade
- `POST /api/agent/auto-trade` - Autonomous trading session
- `GET /api/agent/portfolio` - Portfolio analysis
- `GET /api/agent/status` - Agent status
- `GET /api/health` - Health check

### Data Server Endpoints (Port 3000)

- `GET /api/markets` - Fetch all markets
- `GET /api/markets/sports` - Fetch sports markets
- `GET /api/markets/:id` - Fetch market details
- `GET /api/search?q=query` - Search markets

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           Agent Dashboard (HTML)                │
│         User Interface & Controls               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│        Agent Server (Port 3001)                 │
│     Express API + Mastra Framework              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────┐│
│  │   Trading   │  │   Scanner    │  │  Risk  ││
│  │    Agent    │  │    Agent     │  │Manager ││
│  └──────┬──────┘  └──────┬───────┘  └───┬────┘│
│         │                │               │     │
│         └────────────────┴───────────────┘     │
│                      │                         │
│         ┌────────────┴────────────┐           │
│         │                         │           │
│    ┌────▼─────┐  ┌────────┐  ┌───▼──────┐   │
│    │ Market   │  │ Trade  │  │   Risk   │   │
│    │ Analysis │  │Execution│  │Management│   │
│    │  Tools   │  │ Tools  │  │  Tools   │   │
│    └──────────┘  └────────┘  └──────────┘   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│      Polymarket Data Server (Port 3000)         │
│        Gamma API + SDK Integration              │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│            Polymarket API                       │
│       Live Market Data & Trading                │
└─────────────────────────────────────────────────┘
```

## 🔧 Development

### Project Structure

```
.
├── agent-server.js                 # Agent API server
├── agent-dashboard.html            # Web dashboard
├── src/
│   └── mastra/
│       ├── index.js               # Mastra configuration
│       ├── agents/
│       │   └── trading-agent.js   # Agent definitions
│       └── tools/
│           ├── market-analysis.tool.js
│           ├── trade-execution.tool.js
│           └── risk-management.tool.js
├── server-polymarket.js           # Data server
└── package.json
```

### Adding New Tools

Create a new tool in `src/mastra/tools/`:

```javascript
const { createTool } = require('@mastra/core/tools');
const { z } = require('zod');

const myTool = createTool({
  id: 'my-tool',
  description: 'What this tool does',
  inputSchema: z.object({
    param: z.string()
  }),
  outputSchema: z.object({
    result: z.string()
  }),
  execute: async ({ context }) => {
    // Tool logic here
    return { result: 'success' };
  }
});

module.exports = { myTool };
```

Then add it to the agent in `src/mastra/agents/trading-agent.js`.

## ⚠️ Important Notes

### Safety First

1. **Always use dry-run mode** when testing
2. **Start with small amounts** when going live
3. **Monitor the agent** - don't leave it unattended
4. **Understand the risks** - prediction markets are volatile

### Limitations

- Agent decisions are based on AI analysis and may not always be correct
- Market data may have delays
- Execution is not guaranteed (orders may not fill)
- Past performance doesn't guarantee future results

### Best Practices

1. **Test thoroughly** in dry-run mode
2. **Set conservative limits** on trade sizes
3. **Diversify** across multiple markets
4. **Monitor regularly** - check positions daily
5. **Review agent decisions** - understand the reasoning
6. **Keep credentials secure** - never commit `.env` file

## 📚 Resources

- [Mastra Documentation](https://mastra.ai/docs)
- [Polymarket Documentation](https://docs.polymarket.com)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Kelly Criterion Explained](https://en.wikipedia.org/wiki/Kelly_criterion)

## 🤝 Contributing

This is a research project. Feel free to:
- Report bugs
- Suggest improvements
- Add new features
- Share trading strategies

## 📄 License

MIT License - See LICENSE file for details

## ⚡ Quick Commands

```bash
# Start data server
npm start

# Start agent server
npm run start:agent

# Development mode (auto-reload)
npm run dev:agent

# Check agent status
curl http://localhost:3001/api/agent/status

# Health check
curl http://localhost:3001/api/health
```

## 🎓 Learn More

Check out these files for more details:
- `COMPLETE-UX-UI-RESEARCH.md` - UX research and design
- `implementation-roadmap.md` - Development roadmap
- `SDK-SETUP.md` - Polymarket SDK setup

---

**Built with ❤️ using Mastra AI Framework**

*Remember: This is experimental software. Trade responsibly and never risk more than you can afford to lose.*
