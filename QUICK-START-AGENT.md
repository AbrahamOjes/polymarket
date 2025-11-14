# 🚀 Quick Start: Trading Agent

Get your autonomous Polymarket trading agent running in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `@mastra/core` - AI agent framework
- `@ai-sdk/openai` - OpenAI integration
- `zod` - Schema validation
- All other dependencies

## Step 2: Configure API Keys

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your keys:

```env
# REQUIRED: Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# OPTIONAL: Only needed for live trading
POLYMARKET_API_KEY=your_key
POLYMARKET_SECRET=your_secret
POLYMARKET_PASSPHRASE=your_passphrase
```

**Note:** You only need the OpenAI key to start. Polymarket credentials are only required for live trading (not dry-run mode).

## Step 3: Start the Servers

Open **two terminal windows**:

### Terminal 1: Data Server
```bash
npm start
```
This starts the Polymarket data server on `http://localhost:3000`

### Terminal 2: Agent Server
```bash
npm run start:agent
```
This starts the trading agent server on `http://localhost:3001`

## Step 4: Open the Dashboard

Open `agent-dashboard.html` in your browser, or visit:
```
file:///path/to/agent-dashboard.html
```

## Step 5: Try It Out!

### Example 1: Chat with the Agent

In the dashboard, type:
```
What are the best trading opportunities in sports markets right now?
```

### Example 2: Scan Markets

Click "Scan for Opportunities" with these settings:
- Limit: 20
- Min Volume: $10,000
- Category: Sports

### Example 3: Analyze a Market

Get a market ID from the scan results, then analyze it in detail.

### Example 4: Execute a Trade (Dry Run)

Try executing a trade in dry-run mode (no real money):
- Market ID: (from analysis)
- Outcome: YES or NO
- Amount: $100
- ✅ Dry Run: Checked

## 🎯 What the Agent Does

1. **Scans** markets for mispriced opportunities
2. **Analyzes** probability, volume, liquidity, risk
3. **Calculates** optimal position size using Kelly Criterion
4. **Validates** trades against risk management rules
5. **Executes** trades (dry-run by default)
6. **Monitors** portfolio and provides recommendations

## 🛡️ Safety Features

- ✅ **Dry-run mode by default** - No real money spent
- ✅ **Risk limits** - Max $1,000 per trade
- ✅ **Confidence thresholds** - Minimum 60% confidence
- ✅ **Position sizing** - Kelly Criterion with 0.25 fraction
- ✅ **Portfolio limits** - Max 10% per trade

## 📊 Example Workflow

### Autonomous Trading Session

```bash
curl -X POST http://localhost:3001/api/agent/auto-trade \
  -H "Content-Type: application/json" \
  -d '{
    "maxTrades": 3,
    "maxAmountPerTrade": 100,
    "dryRun": true
  }'
```

The agent will:
1. Check portfolio risk
2. Scan markets for opportunities
3. Analyze top candidates
4. Calculate position sizes
5. Validate against risk criteria
6. Execute trades (simulated)
7. Report results

## 🔧 Troubleshooting

### "Agent Offline" in Dashboard

- Check that agent server is running on port 3001
- Check console for errors
- Verify OpenAI API key is set

### "Failed to fetch market data"

- Check that data server is running on port 3000
- Verify Polymarket API is accessible
- Check network connection

### "Trade execution failed"

- Ensure you're in dry-run mode for testing
- Check that market ID is valid
- Verify amount is within limits

## 🎓 Next Steps

1. **Read the full documentation**: `AGENT-README.md`
2. **Understand the tools**: Check `src/mastra/tools/`
3. **Review the agents**: Check `src/mastra/agents/`
4. **Customize strategies**: Modify agent instructions
5. **Add new tools**: Extend functionality

## 📚 Key Files

- `agent-server.js` - Agent API server
- `agent-dashboard.html` - Web interface
- `src/mastra/agents/trading-agent.js` - Agent definitions
- `src/mastra/tools/` - Trading tools
- `AGENT-README.md` - Full documentation

## ⚡ Quick Commands

```bash
# Start data server
npm start

# Start agent server (new terminal)
npm run start:agent

# Check agent status
curl http://localhost:3001/api/agent/status

# Chat with agent
curl -X POST http://localhost:3001/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Analyze the top sports markets"}'
```

## 🎉 You're Ready!

Your autonomous trading agent is now running. Start with dry-run mode, test thoroughly, and gradually increase confidence as you understand how it works.

**Remember:** This is experimental AI software. Always use dry-run mode for testing and start with small amounts when going live.

---

**Need Help?** Check `AGENT-README.md` for detailed documentation.
