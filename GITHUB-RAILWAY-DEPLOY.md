# 🚀 GitHub + Railway Deployment Guide

## Step-by-Step Deployment

### 📦 **Step 1: Prepare for GitHub**

#### **1.1 Check Git Status**
```bash
# Check if git is initialized
git status

# If not initialized:
git init
```

#### **1.2 Review Files to Commit**
```bash
# See what will be committed
git status

# Should NOT include:
# ❌ .env (secrets)
# ❌ node_modules/ (dependencies)
# ❌ data/ (memory data - backup separately)
# ❌ logs/ (log files)
```

#### **1.3 Add All Files**
```bash
# Add all files (respects .gitignore)
git add .

# Check what's staged
git status
```

#### **1.4 Commit**
```bash
# First commit
git commit -m "Initial commit: EPL Trading Agent with memory system"

# Or if updating
git commit -m "Add Railway deployment configuration and memory system"
```

---

### 🌐 **Step 2: Push to GitHub**

#### **2.1 Create GitHub Repository**

**Option A: Via GitHub Website**
1. Go to https://github.com/new
2. Repository name: `epl-trading-agent`
3. Description: `AI-powered EPL trading agent for Polymarket`
4. Visibility: Private (recommended) or Public
5. **DO NOT** initialize with README (you already have one)
6. Click "Create repository"

**Option B: Via GitHub CLI**
```bash
# Install GitHub CLI if needed
brew install gh  # macOS
# or: npm install -g gh

# Login
gh auth login

# Create repo
gh repo create epl-trading-agent --private --source=. --remote=origin
```

#### **2.2 Add Remote**
```bash
# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/epl-trading-agent.git

# Verify
git remote -v
```

#### **2.3 Push to GitHub**
```bash
# Push to main branch
git branch -M main
git push -u origin main
```

#### **2.4 Verify on GitHub**
1. Go to https://github.com/YOUR_USERNAME/epl-trading-agent
2. Check all files are there
3. Verify .env is NOT there (should be in .gitignore)

---

### 🚂 **Step 3: Deploy to Railway**

#### **3.1 Install Railway CLI**
```bash
# Install
npm install -g @railway/cli

# Verify
railway --version
```

#### **3.2 Login to Railway**
```bash
# Login (opens browser)
railway login

# Verify
railway whoami
```

#### **3.3 Deploy Using Script (Recommended)**
```bash
# Make script executable
chmod +x deploy-to-railway.sh

# Run deployment script
./deploy-to-railway.sh
```

The script will:
- ✅ Check Railway CLI
- ✅ Login if needed
- ✅ Initialize project
- ✅ Set environment variables from .env
- ✅ Deploy to Railway
- ✅ Get deployment URL

#### **3.4 Manual Deploy (Alternative)**
```bash
# Initialize Railway project
railway init

# Set environment variables
railway variables set OPENAI_API_KEY=your_key_here
railway variables set POLYMARKET_API_KEY=your_key_here
railway variables set POLYMARKET_SECRET=your_secret_here
railway variables set POLYMARKET_PASSPHRASE=your_passphrase_here
railway variables set NODE_ENV=production
railway variables set PORT=3001

# Deploy
railway up

# Get URL
railway domain
```

---

### ✅ **Step 4: Verify Deployment**

#### **4.1 Check Health**
```bash
# Get your Railway URL
RAILWAY_URL=$(railway domain)

# Test health endpoint
curl $RAILWAY_URL/api/health

# Should return:
# {
#   "status": "ok",
#   "service": "EPL Prediction Market Trading Agent",
#   "openaiConfigured": true,
#   "polymarketConfigured": true,
#   "memoryInitialized": true
# }
```

#### **4.2 Test API**
```bash
# Test agent status
curl $RAILWAY_URL/api/agent/status

# Test memory
curl $RAILWAY_URL/api/memory/performance/7d

# Test scout
curl "$RAILWAY_URL/api/epl/scout?minEdge=10"
```

#### **4.3 Open Dashboard**
```bash
# Open in browser
railway open

# Or manually visit:
# https://your-app.railway.app/epl-dashboard.html
```

---

### 🔧 **Step 5: Configure Dashboard**

#### **5.1 Update API Endpoint**

Edit `epl-dashboard.html` line ~10:

```javascript
// Change from:
const API_BASE = 'http://localhost:3001/api';

// To:
const API_BASE = 'https://your-app.railway.app/api';
```

#### **5.2 Commit and Push**
```bash
git add epl-dashboard.html
git commit -m "Update API endpoint for Railway deployment"
git push
```

#### **5.3 Redeploy**
```bash
# Railway auto-deploys on git push if connected
# Or manually:
railway up
```

---

### 📊 **Step 6: Monitor Deployment**

#### **6.1 View Logs**
```bash
# Live logs
railway logs

# Last 100 lines
railway logs --lines 100
```

#### **6.2 Check Status**
```bash
railway status
```

#### **6.3 Open Railway Dashboard**
```bash
# Open Railway web dashboard
railway open
```

---

### 🔐 **Step 7: Secure Your Deployment**

#### **7.1 Environment Variables**

In Railway dashboard:
1. Go to your project
2. Click "Variables"
3. Verify all secrets are set:
   - ✅ OPENAI_API_KEY
   - ✅ POLYMARKET_API_KEY
   - ✅ POLYMARKET_SECRET
   - ✅ POLYMARKET_PASSPHRASE
   - ✅ NODE_ENV=production
   - ✅ PORT=3001

#### **7.2 Enable Custom Domain (Optional)**
```bash
# Add custom domain
railway domain add yourdomain.com

# Or use Railway subdomain
railway domain
```

---

### 🎯 **Step 8: Enable Auto-Deploy from GitHub**

#### **8.1 Connect GitHub to Railway**

1. Go to Railway dashboard
2. Click your project
3. Settings → Connect GitHub
4. Select your repository
5. Enable "Auto-deploy on push"

Now every `git push` will auto-deploy! 🎉

#### **8.2 Set Branch**
- Production branch: `main`
- Staging branch: `develop` (optional)

---

### 📈 **Step 9: Set Up Monitoring**

#### **9.1 Enable Railway Metrics**
Railway automatically provides:
- CPU usage
- Memory usage
- Network traffic
- Request logs

#### **9.2 Set Up Alerts**
In Railway dashboard:
1. Settings → Notifications
2. Add email/Slack webhook
3. Set alert thresholds

---

### 🔄 **Step 10: Continuous Deployment Workflow**

```bash
# 1. Make changes locally
vim agent-server.js

# 2. Test locally
npm run start:agent

# 3. Commit changes
git add .
git commit -m "Add new feature"

# 4. Push to GitHub
git push

# 5. Railway auto-deploys!
# Watch logs:
railway logs

# 6. Verify deployment
curl https://your-app.railway.app/api/health
```

---

## 🚀 **Quick Deploy Commands**

### **First Time Setup**
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/epl-trading-agent.git
git push -u origin main

# 2. Deploy to Railway
chmod +x deploy-to-railway.sh
./deploy-to-railway.sh
```

### **Update Deployment**
```bash
# Make changes, then:
git add .
git commit -m "Update description"
git push

# Railway auto-deploys if connected
# Or manually:
railway up
```

---

## 📋 **Deployment Checklist**

### **Before Deployment**
- [ ] All code committed to git
- [ ] .env file configured (not committed)
- [ ] .gitignore includes .env, node_modules, data/
- [ ] package.json has correct start script
- [ ] railway.json configured
- [ ] Procfile created

### **GitHub**
- [ ] Repository created on GitHub
- [ ] Remote added
- [ ] Code pushed to main branch
- [ ] .env NOT in repository (check!)

### **Railway**
- [ ] Railway CLI installed
- [ ] Logged in to Railway
- [ ] Project initialized
- [ ] Environment variables set
- [ ] Deployed successfully
- [ ] Health check passing

### **Post-Deployment**
- [ ] Dashboard accessible
- [ ] API endpoints working
- [ ] Memory system initialized
- [ ] Logs accessible
- [ ] Auto-deploy configured
- [ ] Monitoring enabled

---

## 🆘 **Troubleshooting**

### **Deployment Fails**

```bash
# Check logs
railway logs

# Common issues:
# 1. Missing environment variables
railway variables

# 2. Port conflict
railway variables set PORT=3001

# 3. Build errors
# Check package.json dependencies
```

### **Health Check Fails**

```bash
# Test locally first
npm run start:agent
curl http://localhost:3001/api/health

# Check Railway logs
railway logs --lines 100
```

### **Memory Not Initialized**

```bash
# Check logs for memory errors
railway logs | grep memory

# Ensure data directory is created
# Railway should create it automatically
```

---

## 💰 **Cost Optimization**

### **Railway Free Tier**
- 500 hours/month free
- $5 credit/month
- Perfect for testing

### **Railway Pro**
- $20/month unlimited
- Better for production
- Auto-scaling

### **Reduce Costs**
```bash
# Use environment-based scaling
railway variables set RAILWAY_SCALE_MIN=1
railway variables set RAILWAY_SCALE_MAX=3
```

---

## 🎊 **Success!**

Your EPL trading agent is now:
- ✅ Version controlled on GitHub
- ✅ Deployed to Railway
- ✅ Auto-deploying on push
- ✅ Monitored 24/7
- ✅ Accessible worldwide

**Your URLs:**
- **API**: https://your-app.railway.app/api
- **Dashboard**: https://your-app.railway.app/epl-dashboard.html
- **Health**: https://your-app.railway.app/api/health
- **Memory**: https://your-app.railway.app/api/memory/performance/7d

🚀 **You're live!**
