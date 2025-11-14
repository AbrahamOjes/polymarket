# Setup Guide: Live Polymarket Data Integration

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd "/Users/abrahamojes/CascadeProjects/Prediction market UIUX"
npm install
```

### 2. Configure Environment Variables

Create a `.env` file with your Polymarket API credentials:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your details
nano .env
```

**`.env` file contents:**
```env
# Polymarket API Key (optional - public endpoints work without it)
POLYMARKET_API_KEY=your_api_key_here

# API Base URLs (default values, usually don't need to change)
POLYMARKET_API_BASE=https://gamma-api.polymarket.com
CLOB_API_BASE=https://clob.polymarket.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Start the Backend Server

```bash
npm start
```

You should see:
```
🚀 Polymarket Proxy Server running on http://localhost:3000
📊 API Base: https://gamma-api.polymarket.com
🔑 API Key: Configured (or Not configured)

📍 Endpoints:
   GET /api/markets - Fetch all markets
   GET /api/markets/sports - Fetch sports markets
   GET /api/markets/:id - Fetch market details
   GET /api/search?q=query - Search markets
   GET /api/health - Health check
```

### 4. Open the Live Sports Page

In a new terminal (keep the server running):

```bash
# Open in browser
open http://localhost:3000/sports-live.html
```

---

## 📋 What You Need

### Environment Variables

Share these details with me:

1. **POLYMARKET_API_KEY** (if you have one)
   - Get from: https://docs.polymarket.com/
   - Optional: Public endpoints work without authentication
   
2. **Any custom API endpoints** (if different from defaults)

### Example `.env` File

```env
# If you have an API key
POLYMARKET_API_KEY=pk_live_abc123xyz789

# Or leave blank to use public endpoints
POLYMARKET_API_KEY=

# Server port (default: 3000)
PORT=3000
```

---

## 🔧 API Endpoints

### Backend Proxy Endpoints

All requests go through your backend to avoid CORS:

```javascript
// Fetch all sports markets
GET http://localhost:3000/api/markets/sports?limit=50

// Fetch specific market
GET http://localhost:3000/api/markets/{conditionId}

// Search markets
GET http://localhost:3000/api/search?q=basketball

// Health check
GET http://localhost:3000/api/health
```

---

## 📁 File Structure

```
Prediction market UIUX/
├── .env                    # Your API credentials (create this)
├── .env.example            # Template for .env
├── server.js               # Backend proxy server
├── package.json            # Node dependencies
├── sports-live.html        # Live sports page
├── sports-demo.html        # Demo with sample data
└── src/
    └── api/
        └── polymarket.js   # API helper functions
```

---

## 🧪 Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-06T...",
  "polymarketApi": "https://gamma-api.polymarket.com",
  "apiKeyConfigured": true
}
```

### 2. Test Sports Markets Endpoint

```bash
curl http://localhost:3000/api/markets/sports?limit=5
```

Should return array of sports markets.

### 3. Open in Browser

```
http://localhost:3000/sports-live.html
```

You should see live sports markets with real data!

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'express'"

**Solution:** Install dependencies
```bash
npm install
```

### Error: "Port 3000 already in use"

**Solution:** Change port in `.env`
```env
PORT=3001
```

Then use `http://localhost:3001`

### Error: "Unable to Load Markets"

**Possible causes:**
1. Backend server not running → Run `npm start`
2. Wrong API endpoint → Check `.env` configuration
3. Network issue → Check internet connection

### Error: "API Key not configured"

**Solution:** This is OK! Public endpoints work without authentication. If you have an API key, add it to `.env`:
```env
POLYMARKET_API_KEY=your_key_here
```

---

## 📊 Data Flow

```
Browser (sports-live.html)
    ↓
    Fetch from localhost:3000/api/markets/sports
    ↓
Backend Server (server.js)
    ↓
    Fetch from gamma-api.polymarket.com
    ↓
    Transform & return data
    ↓
Browser renders market cards
```

This avoids CORS issues by routing through your backend.

---

## 🔐 Security Notes

1. **Never commit `.env`** - It's in `.gitignore`
2. **API keys are sensitive** - Don't share publicly
3. **Backend proxy** - Keeps credentials secure
4. **CORS protection** - Backend handles cross-origin requests

---

## 📝 Next Steps

Once setup is complete:

1. ✅ Backend server running
2. ✅ Live data loading
3. ✅ Sports filters working
4. ✅ Real probabilities displaying

You can then:
- Customize the UI further
- Add more market categories
- Implement trading functionality
- Deploy to production

---

## 🆘 Need Help?

Share your `.env` details (without the actual API key) and any error messages you see.

Example:
```
POLYMARKET_API_KEY=[I have one / I don't have one]
PORT=3000
Error message: [paste error here]
```
