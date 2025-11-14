# 🔍 Agent Monitoring Guide

## Keeping Your Agent Online 24/7

This guide explains how to ensure your EPL trading agent is always online and actively scanning for opportunities.

---

## 🎯 **Three Monitoring Strategies**

### **1. Manual Monitoring (Development)**
Run the monitor manually for testing:

```bash
# Basic monitoring (5 min intervals)
node agent-monitor.js

# Custom intervals (in milliseconds)
node agent-monitor.js 60000 10 70 false
# Args: interval(ms) minEdge(%) minConfidence(%) autoTrade(bool)

# Examples:
node agent-monitor.js 300000 10 70 false  # 5 min, 10% edge, 70% confidence
node agent-monitor.js 60000 15 80 false   # 1 min, 15% edge, 80% confidence
node agent-monitor.js 600000 5 60 false   # 10 min, 5% edge, 60% confidence
```

**Output:**
```
[2025-11-14T14:00:00.000Z] 🚀 Starting Agent Monitor...
[2025-11-14T14:00:00.000Z]    - Scan interval: 300s
[2025-11-14T14:00:00.000Z]    - Health check: 60s
[2025-11-14T14:00:00.000Z]    - Min edge: 10%
[2025-11-14T14:00:00.000Z]    - Min confidence: 70%
[2025-11-14T14:00:00.000Z]    - Auto-trade: DISABLED ✅
[2025-11-14T14:00:00.000Z] ✅ Agent Monitor is now running!
[2025-11-14T14:00:01.000Z] ✅ Agent is ONLINE
[2025-11-14T14:00:05.000Z] 🔍 Scan #1: Checking for opportunities...
[2025-11-14T14:00:08.000Z]    ✅ Found 2 opportunities!
[2025-11-14T14:00:08.000Z]    1. Arsenal Top 4 Finish
[2025-11-14T14:00:08.000Z]       Edge: 59% | Confidence: 95%
```

---

### **2. PM2 Process Manager (Recommended for Production)**

PM2 keeps your agent running 24/7 with automatic restarts.

#### **Install PM2:**
```bash
npm install -g pm2
```

#### **Start Agent with PM2:**
```bash
# Start both agent server and monitor
pm2 start ecosystem.config.js

# Or start individually
pm2 start agent-server.js --name epl-agent-server
pm2 start agent-monitor.js --name epl-monitor -- 300000 10 70 false
```

#### **PM2 Commands:**
```bash
# View status
pm2 status

# View logs (live)
pm2 logs

# View specific app logs
pm2 logs epl-agent-server
pm2 logs epl-opportunity-monitor

# Stop
pm2 stop all
pm2 stop epl-agent-server

# Restart
pm2 restart all
pm2 restart epl-opportunity-monitor

# Delete
pm2 delete all

# Monitor dashboard
pm2 monit

# Save configuration (auto-start on reboot)
pm2 save
pm2 startup
```

#### **PM2 Features:**
- ✅ **Auto-restart** on crash
- ✅ **Log management** with rotation
- ✅ **Memory monitoring** (restart if > 1GB)
- ✅ **Scheduled restarts** (every 6 hours)
- ✅ **Cluster mode** for scaling
- ✅ **Zero-downtime** reloads

---

### **3. Cron Jobs (Scheduled Scans)**

Run scans at specific times without keeping process running.

#### **Setup Cron:**
```bash
# Edit crontab
crontab -e

# Add these lines:

# Scan every 5 minutes
*/5 * * * * cd /path/to/project && node agent-monitor.js 60000 10 70 false >> logs/cron.log 2>&1

# Scan every hour
0 * * * * cd /path/to/project && node agent-monitor.js 60000 10 70 false >> logs/cron.log 2>&1

# Scan at specific times (9am, 12pm, 3pm, 6pm)
0 9,12,15,18 * * * cd /path/to/project && node agent-monitor.js 60000 10 70 false >> logs/cron.log 2>&1

# Scan before every match (customize times)
0 14 * * 6,0 cd /path/to/project && node agent-monitor.js 60000 5 60 false >> logs/cron.log 2>&1
```

#### **Cron Schedule Examples:**
```
*/5 * * * *     # Every 5 minutes
*/15 * * * *    # Every 15 minutes
0 * * * *       # Every hour
0 */2 * * *     # Every 2 hours
0 9-17 * * *    # Every hour from 9am-5pm
0 9,12,15,18 * * *  # At 9am, 12pm, 3pm, 6pm
0 0 * * *       # Daily at midnight
```

---

## 📊 **Monitoring Features**

### **Health Checks**
The monitor continuously checks:
- ✅ Agent server status (every 1 minute)
- ✅ API connectivity
- ✅ Response times
- ✅ Error rates

### **Opportunity Scanning**
- 🔍 Scans EPL markets at intervals
- 📈 Filters by edge and confidence
- 🎯 Identifies high-value opportunities
- 📊 Tracks statistics

### **Auto-Trading (Optional)**
```bash
# Enable auto-trading (USE WITH CAUTION!)
node agent-monitor.js 300000 15 80 LIVE

# Dry-run auto-trading (safe testing)
node agent-monitor.js 300000 15 80 true
```

⚠️ **WARNING:** Auto-trading executes real trades automatically!

---

## 🛡️ **Safety Features**

### **Built-in Protections:**
1. **Health Checks** - Detects if agent goes offline
2. **Error Handling** - Continues running on errors
3. **Rate Limiting** - Prevents API overload
4. **Validation** - All trades validated before execution
5. **Logging** - Complete audit trail

### **Recommended Settings:**

**Conservative (Safe):**
```bash
node agent-monitor.js 600000 15 80 false
# 10 min intervals, 15% edge, 80% confidence, no auto-trade
```

**Moderate:**
```bash
node agent-monitor.js 300000 10 70 false
# 5 min intervals, 10% edge, 70% confidence, no auto-trade
```

**Aggressive (Higher Risk):**
```bash
node agent-monitor.js 60000 5 60 false
# 1 min intervals, 5% edge, 60% confidence, no auto-trade
```

---

## 📈 **Monitoring Dashboard**

### **View Real-Time Stats:**
```bash
# PM2 dashboard
pm2 monit

# Web dashboard
pm2 plus
```

### **Custom Dashboard:**
Access via browser: http://localhost:3001/epl-dashboard.html

Features:
- 💰 Wallet balance
- 🔍 Live opportunity scanner
- 📊 Position monitoring
- 📈 Portfolio summary
- ⚡ Trade execution

---

## 🔔 **Alerts & Notifications**

### **Setup Alerts:**

#### **1. Email Alerts (via PM2):**
```bash
pm2 install pm2-auto-pull
pm2 set pm2-auto-pull:email your@email.com
```

#### **2. Slack Alerts:**
```javascript
// Add to agent-monitor.js
const webhook = 'YOUR_SLACK_WEBHOOK_URL';

async function sendSlackAlert(message) {
  await fetch(webhook, {
    method: 'POST',
    body: JSON.stringify({ text: message })
  });
}

// Call when opportunity found
sendSlackAlert(`🎯 Found opportunity: ${opp.market} (${opp.edge}% edge)`);
```

#### **3. SMS Alerts (via Twilio):**
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

async function sendSMS(message) {
  await client.messages.create({
    body: message,
    to: '+1234567890',
    from: '+0987654321'
  });
}
```

---

## 📝 **Logging**

### **Log Files:**
```
logs/
├── agent-server-out.log      # Agent server output
├── agent-server-error.log    # Agent server errors
├── monitor-out.log            # Monitor output
├── monitor-error.log          # Monitor errors
└── cron.log                   # Cron job logs
```

### **View Logs:**
```bash
# Live tail
tail -f logs/monitor-out.log

# Last 100 lines
tail -n 100 logs/monitor-out.log

# Search logs
grep "opportunity" logs/monitor-out.log

# PM2 logs
pm2 logs --lines 100
```

---

## 🚀 **Production Deployment**

### **Step 1: Install Dependencies**
```bash
npm install
npm install -g pm2
```

### **Step 2: Create Logs Directory**
```bash
mkdir -p logs
```

### **Step 3: Start Services**
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
```

### **Step 4: Verify Running**
```bash
pm2 status
pm2 logs
```

### **Step 5: Monitor**
```bash
# Dashboard
pm2 monit

# Or web UI
pm2 plus
```

---

## 🔧 **Troubleshooting**

### **Agent Offline:**
```bash
# Check if running
pm2 status

# Restart
pm2 restart epl-agent-server

# View errors
pm2 logs epl-agent-server --err
```

### **No Opportunities Found:**
```bash
# Lower thresholds
pm2 restart epl-opportunity-monitor --update-env -- 300000 5 60 false

# Check markets manually
curl http://localhost:3001/api/epl/scout?minEdge=5
```

### **High Memory Usage:**
```bash
# Check memory
pm2 status

# Restart if needed
pm2 restart all

# Adjust max memory in ecosystem.config.js
max_memory_restart: '500M'
```

---

## 📊 **Performance Optimization**

### **Interval Recommendations:**

| Use Case | Interval | Min Edge | Min Confidence |
|----------|----------|----------|----------------|
| **Day Trading** | 1-5 min | 5-10% | 60-70% |
| **Swing Trading** | 15-30 min | 10-15% | 70-80% |
| **Position Trading** | 1-6 hours | 15-20% | 80-90% |
| **Conservative** | 6-24 hours | 20%+ | 90%+ |

### **Resource Usage:**

**Agent Server:**
- CPU: ~5-10%
- Memory: ~200-500MB
- Network: Low

**Monitor:**
- CPU: ~1-2%
- Memory: ~50-100MB
- Network: Low

---

## ✅ **Best Practices**

1. **Start Conservative** - High thresholds, no auto-trade
2. **Monitor Logs** - Check regularly for issues
3. **Test First** - Use dry-run mode extensively
4. **Set Alerts** - Get notified of opportunities
5. **Review Regularly** - Adjust thresholds based on results
6. **Backup Data** - Save logs and transaction history
7. **Update Regularly** - Keep dependencies updated
8. **Scale Gradually** - Increase frequency/amounts slowly

---

## 🎯 **Quick Start Commands**

```bash
# Development (manual)
node agent-monitor.js

# Production (PM2)
pm2 start ecosystem.config.js
pm2 save
pm2 logs

# Stop everything
pm2 stop all

# Restart everything
pm2 restart all

# View status
pm2 status
pm2 monit
```

---

## 📞 **Support**

If the monitor stops working:
1. Check agent server is running: `pm2 status`
2. Check logs: `pm2 logs`
3. Restart services: `pm2 restart all`
4. Verify credentials in `.env`
5. Test API manually: `curl http://localhost:3001/api/agent/status`

---

**Your agent is now monitoring 24/7!** 🚀⚽💰
