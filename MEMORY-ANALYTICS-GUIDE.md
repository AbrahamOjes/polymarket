# 📊 Agent Memory & Analytics Guide

## Overview

Your EPL trading agent now has **persistent memory** that automatically records and analyzes all trading activity.

---

## 🧠 **What Gets Stored**

### **1. Decisions** 
Every decision made by the agent:
- Which action was taken
- Reasoning behind it
- Confidence level
- Outcome

### **2. Trades**
All executed trades:
- Market details
- Entry/exit prices
- Profit/loss
- Edge and confidence
- Success/failure

### **3. Opportunities**
Markets scanned:
- Edge detected
- Confidence score
- Whether traded
- Outcome

### **4. Performance**
Metrics over time:
- Win rate
- Total profit/loss
- Average edge
- Sharpe ratio

### **5. Learnings**
Patterns discovered:
- What works
- What doesn't
- Market conditions
- Optimal strategies

---

## 📡 **Memory API Endpoints**

### **Get Performance Metrics**

```bash
# Last 7 days
curl http://localhost:3001/api/memory/performance/7d

# Last 30 days
curl http://localhost:3001/api/memory/performance/30d

# Last 24 hours
curl http://localhost:3001/api/memory/performance/24h
```

**Response:**
```json
{
  "timeframe": "7d",
  "totalTrades": 25,
  "successfulTrades": 17,
  "failedTrades": 8,
  "winRate": 68,
  "totalProfit": 125.50,
  "totalLoss": 45.20,
  "netProfit": 80.30,
  "averageEdge": 12.3,
  "averageConfidence": 72.5,
  "roi": 63.8
}
```

### **Get Trade History**

```bash
# All trades
curl http://localhost:3001/api/memory/trades

# Filter by user
curl http://localhost:3001/api/memory/trades?userId=demo-trader

# Filter by date range
curl "http://localhost:3001/api/memory/trades?startDate=2025-11-01&endDate=2025-11-14"

# Filter by market
curl http://localhost:3001/api/memory/trades?marketId=582133
```

**Response:**
```json
{
  "trades": [
    {
      "id": "1699876543210_abc123",
      "timestamp": "2025-11-14T14:30:00.000Z",
      "userId": "demo-trader",
      "marketId": "582133",
      "outcome": "YES",
      "side": "BUY",
      "amount": 50,
      "price": 0.68,
      "edge": 15.5,
      "confidence": 75,
      "result": {
        "success": true,
        "profit": 12.50
      }
    }
  ],
  "count": 1
}
```

### **Get Recent Opportunities**

```bash
# Last 10 opportunities
curl http://localhost:3001/api/memory/opportunities

# Last 50 opportunities
curl http://localhost:3001/api/memory/opportunities?limit=50
```

### **Export All Data**

```bash
# Export as JSON
curl http://localhost:3001/api/memory/export > memory.json

# Export as CSV
curl "http://localhost:3001/api/memory/export?format=csv" > memory.csv
```

### **Get Learned Patterns**

```bash
# All patterns
curl http://localhost:3001/api/memory/learnings

# High confidence patterns only
curl "http://localhost:3001/api/memory/learnings?minConfidence=80"
```

### **Clean Old Data**

```bash
# Remove entries older than 90 days
curl -X POST http://localhost:3001/api/memory/cleanup
```

---

## 📈 **Analytics Examples**

### **1. Performance Dashboard**

```javascript
// Fetch performance data
const response = await fetch('http://localhost:3001/api/memory/performance/30d');
const data = await response.json();

console.log(`Win Rate: ${data.winRate}%`);
console.log(`Net Profit: $${data.netProfit}`);
console.log(`ROI: ${data.roi}%`);
```

### **2. Trade Analysis**

```javascript
// Get all trades
const trades = await fetch('http://localhost:3001/api/memory/trades')
  .then(r => r.json());

// Calculate average profit per trade
const avgProfit = trades.trades
  .filter(t => t.result?.success)
  .reduce((sum, t) => sum + t.result.profit, 0) / trades.count;

console.log(`Average profit per winning trade: $${avgProfit.toFixed(2)}`);
```

### **3. Best Performing Markets**

```javascript
// Get trade history
const trades = await fetch('http://localhost:3001/api/memory/trades')
  .then(r => r.json());

// Group by market
const byMarket = trades.trades.reduce((acc, trade) => {
  if (!acc[trade.marketId]) {
    acc[trade.marketId] = { trades: 0, profit: 0 };
  }
  acc[trade.marketId].trades++;
  acc[trade.marketId].profit += trade.result?.profit || 0;
  return acc;
}, {});

// Find best market
const best = Object.entries(byMarket)
  .sort((a, b) => b[1].profit - a[1].profit)[0];

console.log(`Best market: ${best[0]} with $${best[1].profit} profit`);
```

### **4. Edge vs Outcome Analysis**

```javascript
// Analyze if higher edge = better outcomes
const trades = await fetch('http://localhost:3001/api/memory/trades')
  .then(r => r.json());

const highEdge = trades.trades.filter(t => t.edge > 15);
const lowEdge = trades.trades.filter(t => t.edge <= 15);

const highEdgeWinRate = highEdge.filter(t => t.result?.success).length / highEdge.length;
const lowEdgeWinRate = lowEdge.filter(t => t.result?.success).length / lowEdge.length;

console.log(`High edge (>15%) win rate: ${(highEdgeWinRate * 100).toFixed(1)}%`);
console.log(`Low edge (<=15%) win rate: ${(lowEdgeWinRate * 100).toFixed(1)}%`);
```

---

## 🔬 **Advanced Analytics**

### **Export to Python/Pandas**

```python
import requests
import pandas as pd
import matplotlib.pyplot as plt

# Fetch data
response = requests.get('http://localhost:3001/api/memory/export')
data = response.json()

# Convert to DataFrame
trades_df = pd.DataFrame(data['data']['trades'])

# Analysis
print(trades_df.describe())
print(f"Win rate: {trades_df['result'].apply(lambda x: x.get('success', False)).mean():.2%}")

# Plot
trades_df['profit'] = trades_df['result'].apply(lambda x: x.get('profit', 0))
trades_df['profit'].cumsum().plot(title='Cumulative Profit')
plt.show()
```

### **Export to Google Sheets**

```bash
# 1. Export as CSV
curl "http://localhost:3001/api/memory/export?format=csv" > trades.csv

# 2. Upload to Google Sheets
# - Go to sheets.google.com
# - File → Import → Upload
# - Select trades.csv

# 3. Create charts and analysis
```

### **Export to Tableau/PowerBI**

```bash
# Export CSV
curl "http://localhost:3001/api/memory/export?format=csv" > agent-data.csv

# Import to Tableau:
# 1. Open Tableau
# 2. Connect to Data → Text File
# 3. Select agent-data.csv
# 4. Create visualizations
```

---

## 📊 **Automatic Recording**

The agent automatically records data when you:

### **Execute a Trade**
```javascript
// Trade is automatically recorded
await fetch('http://localhost:3001/api/agent/execute-trade', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    marketId: '582133',
    outcome: 'YES',
    side: 'BUY',
    amount: 50,
    dryRun: false
  })
});

// Memory automatically stores:
// - Trade details
// - Decision reasoning
// - Expected outcome
// - Actual result
```

### **Scout Markets**
```javascript
// Opportunities are automatically recorded
await fetch('http://localhost:3001/api/epl/scout?minEdge=10');

// Memory stores:
// - All opportunities found
// - Edge calculations
// - Confidence scores
// - Timestamps
```

---

## 🎯 **Use Cases**

### **1. Optimize Strategy**

```javascript
// Find optimal edge threshold
const performance = await Promise.all([
  fetch('http://localhost:3001/api/memory/trades?edge=5-10').then(r => r.json()),
  fetch('http://localhost:3001/api/memory/trades?edge=10-15').then(r => r.json()),
  fetch('http://localhost:3001/api/memory/trades?edge=15+').then(r => r.json())
]);

// Compare win rates
// Adjust minEdge in agent-monitor.js accordingly
```

### **2. Track Learning**

```javascript
// See what patterns agent has learned
const learnings = await fetch('http://localhost:3001/api/memory/learnings')
  .then(r => r.json());

learnings.patterns.forEach(p => {
  console.log(`Pattern: ${p.pattern}`);
  console.log(`Confidence: ${p.confidence}%`);
  console.log(`Outcome: ${p.outcome}`);
});
```

### **3. Performance Reports**

```javascript
// Weekly performance report
const weekly = await fetch('http://localhost:3001/api/memory/performance/7d')
  .then(r => r.json());

const report = `
📊 Weekly Performance Report
===========================
Total Trades: ${weekly.totalTrades}
Win Rate: ${weekly.winRate}%
Net Profit: $${weekly.netProfit}
ROI: ${weekly.roi}%
Average Edge: ${weekly.averageEdge}%
`;

console.log(report);
// Email this report, post to Slack, etc.
```

### **4. Backtesting**

```javascript
// Analyze past decisions
const trades = await fetch('http://localhost:3001/api/memory/trades')
  .then(r => r.json());

// What if we only traded high confidence (>80%)?
const highConfTrades = trades.trades.filter(t => t.confidence > 80);
const highConfWinRate = highConfTrades.filter(t => t.result?.success).length / highConfTrades.length;

console.log(`High confidence strategy would have ${(highConfWinRate * 100).toFixed(1)}% win rate`);
```

---

## 🔄 **Data Retention**

- **Default**: 90 days
- **Configurable** in `agent-memory.js`
- **Automatic cleanup** removes old entries
- **Manual cleanup**: `POST /api/memory/cleanup`

---

## 💾 **Data Storage**

Memory is stored in:
```
data/
└── memory/
    ├── decisions.json      # All agent decisions
    ├── trades.json         # Trade history
    ├── opportunities.json  # Found opportunities
    ├── performance.json    # Performance metrics
    └── learnings.json      # Learned patterns
```

**Backup regularly:**
```bash
# Backup memory
tar -czf memory-backup-$(date +%Y%m%d).tar.gz data/memory/

# Restore from backup
tar -xzf memory-backup-20251114.tar.gz
```

---

## 🚀 **Quick Start**

```bash
# 1. Start agent server (memory auto-initializes)
npm run start:agent

# 2. Check memory is working
curl http://localhost:3001/api/health
# Should show: "memoryInitialized": true

# 3. Execute some trades (dry-run)
node dry-run-demo.js

# 4. View performance
curl http://localhost:3001/api/memory/performance/7d

# 5. Export data
curl http://localhost:3001/api/memory/export > my-data.json
```

---

## 📈 **Dashboard Integration**

Add memory analytics to your dashboard:

```html
<!-- Add to epl-dashboard.html -->
<div id="analytics-tab">
  <h3>Performance Analytics</h3>
  <div id="performance-stats"></div>
  <button onclick="loadPerformance()">Refresh</button>
</div>

<script>
async function loadPerformance() {
  const data = await fetch('http://localhost:3001/api/memory/performance/7d')
    .then(r => r.json());
  
  document.getElementById('performance-stats').innerHTML = `
    <p>Total Trades: ${data.totalTrades}</p>
    <p>Win Rate: ${data.winRate}%</p>
    <p>Net Profit: $${data.netProfit}</p>
    <p>ROI: ${data.roi}%</p>
  `;
}
</script>
```

---

## ✅ **Summary**

Your agent now has:

✅ **Persistent memory** - Never forgets
✅ **Automatic recording** - No manual work
✅ **Performance analytics** - Track everything
✅ **Export capabilities** - Use any tool
✅ **Pattern learning** - Gets smarter over time
✅ **API access** - Full programmatic control

**The agent learns from every trade and gets better over time!** 🧠📈
