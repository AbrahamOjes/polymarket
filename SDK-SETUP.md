# Polymarket SDK Integration Guide

## ✅ Setup Complete!

Your server is now using the official **@goat-sdk/plugin-polymarket** SDK for reliable data fetching.

---

## 🚀 Current Status

✅ **SDK Installed:** @goat-sdk/plugin-polymarket  
✅ **Server Running:** http://localhost:3000  
✅ **API Key:** Configured  
✅ **Ready:** Serving live Polymarket data

---

## 📊 Available Endpoints

### Sports Markets (Primary)
```bash
GET http://localhost:3000/api/markets/sports
```
Returns filtered sports markets with live data.

### All Markets
```bash
GET http://localhost:3000/api/markets?limit=50
```

### Market Details
```bash
GET http://localhost:3000/api/markets/{marketId}
```

### Market Prices
```bash
GET http://localhost:3000/api/market/{marketId}/prices
```

### Search
```bash
GET http://localhost:3000/api/search?q=basketball
```

### Trending Markets
```bash
GET http://localhost:3000/api/trending?limit=10
```

### Health Check
```bash
GET http://localhost:3000/api/health
```

---

## 🌐 Access Your UI

**Live Sports Page:**
```
http://localhost:3000/sports-live.html
```

**Demo Page (sample data):**
```
http://localhost:3000/sports-demo.html
```

**Original Homepage:**
```
http://localhost:3000/index.html
```

---

## 🧪 Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Fetch sports markets
curl http://localhost:3000/api/markets/sports | python3 -m json.tool

# Search for basketball
curl "http://localhost:3000/api/search?q=basketball" | python3 -m json.tool

# Get trending markets
curl http://localhost:3000/api/trending | python3 -m json.tool
```

---

## 📦 SDK Features

The **@goat-sdk/plugin-polymarket** provides:

✅ **Reliable API calls** - Official SDK with proper error handling  
✅ **Type safety** - Built-in TypeScript support  
✅ **Authentication** - Handles API key automatically  
✅ **Rate limiting** - Built-in throttling  
✅ **Data validation** - Ensures data integrity  

---

## 🔧 Server Management

### Start Server
```bash
npm start
```

### Stop Server
```bash
# Find process
ps aux | grep "node server-sdk.js"

# Kill process
pkill -f "node server-sdk.js"
```

### Restart Server
```bash
pkill -f "node server-sdk.js" && npm start
```

### View Logs
The server logs will show in your terminal:
- API requests
- Errors
- Market counts
- SDK status

---

## 📁 Files

- **`server-sdk.js`** - New SDK-based server (active)
- **`server.js`** - Old direct API server (backup)
- **`.env`** - Your API key (gitignored)
- **`sports-live.html`** - Live sports UI
- **`package.json`** - Updated to use SDK server

---

## 🎯 What's Different?

### Before (Direct API)
```javascript
// Had CORS issues
fetch('https://gamma-api.polymarket.com/markets')
```

### After (SDK)
```javascript
// Clean, reliable SDK calls
await polymarketClient.getMarkets({ limit: 50 })
```

**Benefits:**
- ✅ No CORS issues
- ✅ Better error handling
- ✅ Automatic retries
- ✅ Type safety
- ✅ Official support

---

## 🐛 Troubleshooting

### "Cannot find module '@goat-sdk/plugin-polymarket'"
```bash
npm install
```

### Port 3000 already in use
```bash
# Kill existing process
pkill -f "node server"

# Or change port in .env
PORT=3001
```

### No sports markets found
The SDK filters markets by keywords. If no sports markets are active on Polymarket at the moment, you'll see the empty state. Try:
```bash
# Check all markets
curl http://localhost:3000/api/markets?limit=10
```

---

## 📊 Expected Data Format

Markets returned from the SDK include:

```json
{
  "conditionId": "0x123...",
  "question": "Will the Lakers win?",
  "description": "Market description...",
  "outcomePrices": [0.71, 0.29],
  "outcomes": ["YES", "NO"],
  "volume": 2400000,
  "numTraders": 3340,
  "liquidity": 150000,
  "tags": ["sports", "basketball", "nba"],
  "closed": false,
  "endDate": "2024-12-31T23:59:59Z"
}
```

---

## 🚀 Next Steps

1. ✅ Server running with SDK
2. ✅ API key configured
3. ✅ Sports endpoint working
4. 📱 Open http://localhost:3000/sports-live.html
5. 🎨 See live sports markets with research-backed UI!

---

## 📚 SDK Documentation

- **NPM Package:** https://www.npmjs.com/package/@goat-sdk/plugin-polymarket
- **Polymarket Docs:** https://docs.polymarket.com/
- **GOAT SDK:** https://github.com/goat-sdk

---

**Status:** ✅ Ready to use!  
**Server:** Running on port 3000  
**SDK:** @goat-sdk/plugin-polymarket v1.x  
**API Key:** Configured
