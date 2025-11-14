# 🚀 DEPLOY NOW - Quick Reference

## ✅ **Status: Ready to Deploy!**

Your code is now on GitHub: https://github.com/AbrahamOjes/polymarket

---

## 🎯 **Deploy to Railway (3 Steps)**

### **Option 1: Automated Script (Recommended)**

```bash
# Run the deployment script
./deploy-to-railway.sh
```

This will:
- ✅ Check Railway CLI
- ✅ Login if needed
- ✅ Initialize project
- ✅ Set environment variables
- ✅ Deploy your app
- ✅ Give you the live URL

---

### **Option 2: Manual Deployment**

#### **Step 1: Install & Login**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login (opens browser)
railway login
```

#### **Step 2: Initialize Project**
```bash
# Create new Railway project
railway init
```

#### **Step 3: Set Environment Variables**
```bash
# Copy from your .env file
railway variables set OPENAI_API_KEY=your_key_here
railway variables set POLYMARKET_API_KEY=your_key_here
railway variables set POLYMARKET_SECRET=your_secret_here
railway variables set POLYMARKET_PASSPHRASE=your_passphrase_here
railway variables set NODE_ENV=production
railway variables set PORT=3001
```

#### **Step 4: Deploy**
```bash
# Deploy to Railway
railway up

# Get your live URL
railway domain
```

---

## 🌐 **After Deployment**

### **1. Get Your URLs**
```bash
# Your Railway URL
railway domain

# Example output:
# https://epl-trading-agent-production.up.railway.app
```

### **2. Test Deployment**
```bash
# Replace with your actual URL
RAILWAY_URL="https://your-app.railway.app"

# Test health
curl $RAILWAY_URL/api/health

# Test agent
curl $RAILWAY_URL/api/agent/status

# Test memory
curl $RAILWAY_URL/api/memory/performance/7d
```

### **3. Open Dashboard**
```bash
# Open in browser
railway open

# Or visit directly:
# https://your-app.railway.app/epl-dashboard.html
```

---

## 🔧 **Update Dashboard API Endpoint**

After deployment, update your dashboard to use the Railway URL:

1. Edit `epl-dashboard.html` (line ~10)
2. Change:
   ```javascript
   const API_BASE = 'http://localhost:3001/api';
   ```
   To:
   ```javascript
   const API_BASE = 'https://your-app.railway.app/api';
   ```
3. Commit and push:
   ```bash
   git add epl-dashboard.html
   git commit -m "Update API endpoint for Railway"
   git push
   ```
4. Redeploy:
   ```bash
   railway up
   ```

---

## 📊 **Monitor Your Deployment**

```bash
# View live logs
railway logs

# Check status
railway status

# Open Railway dashboard
railway open
```

---

## 🔐 **Environment Variables Needed**

Make sure these are set in Railway:

```
✅ OPENAI_API_KEY          - Your OpenAI API key
✅ POLYMARKET_API_KEY      - Your Polymarket API key
✅ POLYMARKET_SECRET       - Your Polymarket secret
✅ POLYMARKET_PASSPHRASE   - Your Polymarket passphrase
✅ NODE_ENV                - production
✅ PORT                    - 3001
```

---

## 🎯 **Quick Commands**

```bash
# Deploy
./deploy-to-railway.sh

# View logs
railway logs

# Get URL
railway domain

# Redeploy
railway up

# Open dashboard
railway open
```

---

## 📚 **Full Documentation**

- **Deployment Guide**: `GITHUB-RAILWAY-DEPLOY.md`
- **Memory System**: `MEMORY-ANALYTICS-GUIDE.md`
- **Monitoring**: `MONITORING-GUIDE.md`
- **Scaling**: `SCALING-ARCHITECTURE.md`

---

## ✅ **Deployment Checklist**

- [x] Code committed to Git
- [x] Pushed to GitHub
- [ ] Railway CLI installed
- [ ] Logged in to Railway
- [ ] Environment variables ready
- [ ] Deploy script executed
- [ ] Health check passing
- [ ] Dashboard accessible

---

## 🆘 **Troubleshooting**

### **Railway CLI not found**
```bash
npm install -g @railway/cli
```

### **Login fails**
```bash
railway logout
railway login
```

### **Deployment fails**
```bash
# Check logs
railway logs

# Verify environment variables
railway variables
```

### **Health check fails**
```bash
# Test locally first
npm run start:agent
curl http://localhost:3001/api/health
```

---

## 🎊 **You're Ready!**

Run this command to deploy:

```bash
./deploy-to-railway.sh
```

Or manually:

```bash
railway login
railway init
railway up
railway domain
```

**Your EPL trading agent will be live in ~2 minutes!** 🚀

---

## 📞 **Next Steps After Deploy**

1. ✅ Test health endpoint
2. ✅ Open dashboard
3. ✅ Execute test trade (dry-run)
4. ✅ Monitor logs
5. ✅ Set up auto-deploy from GitHub
6. ✅ Enable monitoring alerts

**Let's deploy!** 🎉
