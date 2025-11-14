# 🚀 Deployment Guide - EPL Trading Agent

## Architecture Overview

Your EPL trading system has **two parts**:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (UI)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  epl-dashboard.html                              │  │
│  │  - Wallet management                             │  │
│  │  - Market scouting                               │  │
│  │  - Trade execution                               │  │
│  │  - Live monitoring                               │  │
│  └──────────────────────────────────────────────────┘  │
│              ↓ API Calls                                │
│  Hosted on: Netlify, Vercel, Cloudflare Pages          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Agent Server)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  agent-server.js                                 │  │
│  │  - 11 AI agents                                  │  │
│  │  - 17 trading tools                              │  │
│  │  - Polymarket API integration                    │  │
│  │  - Agent memory & analytics                      │  │
│  └──────────────────────────────────────────────────┘  │
│              ↓ Connects to                              │
│  Hosted on: Railway, Render, AWS, Heroku               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                     │
│  - Polymarket API                                       │
│  - OpenAI API (GPT-4)                                   │
│  - Database (PostgreSQL/MongoDB)                        │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ **IMPORTANT: Netlify Limitations**

**Netlify can ONLY host the frontend (static HTML/CSS/JS).**

❌ **Cannot host on Netlify:**
- Node.js backend server
- AI agents (require persistent processes)
- WebSocket connections
- Long-running processes
- Database connections

✅ **Can host on Netlify:**
- Static dashboard (epl-dashboard.html)
- HTML/CSS/JavaScript files
- Static assets

---

## 🎯 **Deployment Strategy**

### **Option 1: Split Deployment (Recommended)**

**Frontend → Netlify** (Free)
**Backend → Railway** (Free tier available)

### **Option 2: All-in-One**

**Everything → Railway/Render** (Serves both frontend and backend)

### **Option 3: Enterprise**

**Frontend → Cloudflare Pages**
**Backend → AWS/GCP** (Auto-scaling)

---

## 📦 **Option 1: Split Deployment (Netlify + Railway)**

### **Part A: Deploy Frontend to Netlify**

#### **Step 1: Prepare Frontend**

```bash
# Build frontend
npm run build:frontend

# This creates:
# public/index.html (your dashboard)
```

#### **Step 2: Install Netlify CLI**

```bash
npm install -g netlify-cli
```

#### **Step 3: Login to Netlify**

```bash
netlify login
```

#### **Step 4: Deploy**

```bash
# Initialize Netlify site
netlify init

# Deploy
netlify deploy --prod

# Or use the script
npm run deploy:frontend
```

#### **Step 5: Configure Environment Variables**

In Netlify dashboard (app.netlify.com):
1. Go to Site Settings → Environment Variables
2. Add:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```

#### **Step 6: Update Dashboard**

Edit `epl-dashboard.html` to use environment variable:

```javascript
// Change this line:
const API_BASE = 'http://localhost:3001/api';

// To this:
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
```

---

### **Part B: Deploy Backend to Railway**

#### **Step 1: Create Railway Account**

Go to https://railway.app and sign up (free tier available)

#### **Step 2: Install Railway CLI**

```bash
npm install -g @railway/cli
```

#### **Step 3: Login**

```bash
railway login
```

#### **Step 4: Initialize Project**

```bash
railway init
```

#### **Step 5: Add Environment Variables**

```bash
railway variables set OPENAI_API_KEY=your_key_here
railway variables set POLYMARKET_API_KEY=your_key_here
railway variables set POLYMARKET_SECRET=your_secret_here
railway variables set POLYMARKET_PASSPHRASE=your_passphrase_here
railway variables set PORT=3001
railway variables set NODE_ENV=production
```

#### **Step 6: Create Procfile**

Create `Procfile` in project root:

```
web: node agent-server.js
worker: node agent-monitor.js 300000 10 70 false
```

#### **Step 7: Deploy**

```bash
# Deploy to Railway
railway up

# Or use the script
npm run deploy:backend
```

#### **Step 8: Get Your Backend URL**

```bash
railway domain
# Returns: https://your-app.railway.app
```

#### **Step 9: Update Frontend**

Go back to Netlify and update the environment variable:
```
VITE_API_BASE_URL=https://your-app.railway.app
```

---

## 📦 **Option 2: All-in-One Deployment (Railway)**

Deploy everything to Railway (simpler but costs more):

#### **Step 1: Update package.json**

```json
{
  "scripts": {
    "start": "node agent-server.js",
    "build": "echo 'No build needed'"
  }
}
```

#### **Step 2: Create railway.json**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node agent-server.js",
    "healthcheckPath": "/api/agent/status"
  }
}
```

#### **Step 3: Deploy**

```bash
railway init
railway up
```

#### **Step 4: Access**

Your dashboard will be at: `https://your-app.railway.app/epl-dashboard.html`

---

## 📦 **Option 3: Render Deployment**

Alternative to Railway:

#### **Step 1: Create render.yaml**

```yaml
services:
  - type: web
    name: epl-agent-server
    env: node
    buildCommand: npm install
    startCommand: node agent-server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: OPENAI_API_KEY
        sync: false
      - key: POLYMARKET_API_KEY
        sync: false
      - key: POLYMARKET_SECRET
        sync: false
      - key: POLYMARKET_PASSPHRASE
        sync: false
```

#### **Step 2: Deploy**

1. Go to https://render.com
2. Connect your GitHub repo
3. Select "New Web Service"
4. Configure environment variables
5. Deploy!

---

## 🗄️ **Agent Memory & Data Collection**

### **Memory System Features**

Your agent now has **persistent memory** that stores:

1. **Decisions** - Every decision made by agents
2. **Trades** - All executed trades
3. **Opportunities** - Found market opportunities
4. **Performance** - Performance metrics over time
5. **Learnings** - Patterns learned from outcomes

### **How It Works**

```javascript
// Agent automatically records everything
const { getAgentMemory } = require('./src/mastra/memory/agent-memory');

const memory = getAgentMemory();
await memory.init();

// Record a trade
await memory.recordTrade({
  userId: 'user123',
  marketId: '582133',
  outcome: 'YES',
  side: 'BUY',
  amount: 50,
  edge: 15.5,
  confidence: 75,
  result: { success: true, profit: 12.50 }
});

// Analyze performance
const performance = await memory.analyzePerformance('7d');
console.log(performance);
// {
//   totalTrades: 25,
//   winRate: 68%,
//   netProfit: $125.50,
//   averageEdge: 12.3%
// }

// Find similar past decisions
const similar = await memory.findSimilarDecisions({
  edge: 15,
  confidence: 70
});

// Export for analysis
const data = await memory.exportMemory('json');
// Save to file or send to analytics platform
```

### **Data Storage**

Memory is stored in:
```
data/
└── memory/
    ├── decisions.json
    ├── trades.json
    ├── opportunities.json
    ├── performance.json
    └── learnings.json
```

### **Analytics Integration**

Export memory for analysis in:

**1. Google Sheets**
```bash
curl http://your-backend.railway.app/api/memory/export?format=csv > trades.csv
# Import to Google Sheets
```

**2. Python/Pandas**
```python
import requests
import pandas as pd

data = requests.get('http://your-backend.railway.app/api/memory/export').json()
df = pd.DataFrame(data['data']['trades'])
df.describe()
```

**3. Tableau/PowerBI**
```bash
# Export as CSV
curl http://your-backend.railway.app/api/memory/export?format=csv > data.csv
# Import to Tableau/PowerBI
```

---

## 📊 **Memory API Endpoints**

Add these to `agent-server.js`:

```javascript
// Get performance metrics
app.get('/api/memory/performance/:timeframe', async (req, res) => {
  const { timeframe } = req.params;
  const performance = await memory.analyzePerformance(timeframe);
  res.json(performance);
});

// Get trade history
app.get('/api/memory/trades', async (req, res) => {
  const trades = await memory.getTradeHistory(req.query);
  res.json(trades);
});

// Get opportunities
app.get('/api/memory/opportunities', async (req, res) => {
  const opportunities = await memory.getRecentOpportunities(
    parseInt(req.query.limit) || 10
  );
  res.json(opportunities);
});

// Export memory
app.get('/api/memory/export', async (req, res) => {
  const format = req.query.format || 'json';
  const data = await memory.exportMemory(format);
  
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=memory.csv');
  }
  
  res.send(data);
});

// Get learned patterns
app.get('/api/memory/learnings', async (req, res) => {
  const patterns = await memory.getLearnedPatterns(req.query);
  res.json(patterns);
});
```

---

## 🔐 **Environment Variables**

### **Required for Backend:**

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Polymarket
POLYMARKET_API_KEY=...
POLYMARKET_SECRET=...
POLYMARKET_PASSPHRASE=...

# Server
PORT=3001
NODE_ENV=production

# Optional: Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### **Required for Frontend:**

```bash
# API endpoint
VITE_API_BASE_URL=https://your-backend.railway.app
```

---

## 🚀 **Quick Deploy Commands**

```bash
# Frontend to Netlify
npm run build:frontend
netlify deploy --prod

# Backend to Railway
railway up

# Both (after setup)
npm run deploy:frontend && npm run deploy:backend
```

---

## 📈 **Monitoring Deployed App**

### **Railway Dashboard**
- View logs: `railway logs`
- Check metrics: Railway dashboard
- Monitor uptime: Built-in

### **Netlify Dashboard**
- View deploys: Netlify dashboard
- Check analytics: Built-in
- Monitor performance: Lighthouse scores

### **Custom Monitoring**
```bash
# Health check
curl https://your-backend.railway.app/api/agent/status

# Performance metrics
curl https://your-backend.railway.app/api/memory/performance/7d
```

---

## 💰 **Cost Estimates**

### **Free Tier:**
- **Netlify**: Free (100GB bandwidth)
- **Railway**: $5/month (500 hours)
- **Render**: Free (750 hours)

### **Paid Tier:**
- **Railway Pro**: $20/month (unlimited)
- **Render Standard**: $7/month per service
- **AWS/GCP**: ~$30-50/month

### **API Costs:**
- **OpenAI GPT-4**: ~$0.03 per 1K tokens
- **Polymarket**: Free API
- **Estimated**: $20-50/month for moderate usage

---

## ✅ **Deployment Checklist**

- [ ] Environment variables configured
- [ ] Frontend deployed to Netlify
- [ ] Backend deployed to Railway/Render
- [ ] API endpoint updated in frontend
- [ ] Health checks passing
- [ ] Memory system initialized
- [ ] Monitoring enabled
- [ ] Logs accessible
- [ ] Auto-restart configured
- [ ] Backup strategy in place

---

## 🎊 **You're Ready to Deploy!**

**Recommended Path:**
1. Deploy backend to Railway first
2. Get backend URL
3. Deploy frontend to Netlify
4. Update frontend with backend URL
5. Test everything
6. Enable monitoring
7. Start trading!

**Your agent will have:**
- ✅ 24/7 uptime
- ✅ Persistent memory
- ✅ Performance analytics
- ✅ Auto-scaling
- ✅ Global CDN (frontend)
- ✅ Automatic backups

🚀 **Let's deploy!**
