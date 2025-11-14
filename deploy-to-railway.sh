#!/bin/bash

# Deploy EPL Trading Agent to Railway
# This script prepares and deploys your app to Railway

set -e  # Exit on error

echo "🚀 EPL Trading Agent - Railway Deployment"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found"
fi

echo ""

# Check if logged in to Railway
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "⚠️  Not logged in to Railway"
    echo "🔑 Please login to Railway..."
    railway login
else
    echo "✅ Already logged in to Railway"
fi

echo ""

# Check for required files
echo "📋 Checking required files..."
required_files=("package.json" "agent-server.js" ".env.example" "railway.json" "Procfile")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files: ${missing_files[*]}"
    exit 1
fi

echo "✅ All required files present"
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
required_vars=("OPENAI_API_KEY" "POLYMARKET_API_KEY" "POLYMARKET_SECRET" "POLYMARKET_PASSPHRASE")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env 2>/dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "⚠️  Warning: Missing environment variables in .env: ${missing_vars[*]}"
    echo "   You'll need to set these in Railway dashboard"
else
    echo "✅ Environment variables configured in .env"
fi

echo ""

# Initialize Railway project if needed
echo "🎯 Initializing Railway project..."
if [ ! -d ".railway" ]; then
    echo "📦 Creating new Railway project..."
    railway init
else
    echo "✅ Railway project already initialized"
fi

echo ""

# Set environment variables from .env
echo "🔧 Setting environment variables in Railway..."
if [ -f ".env" ]; then
    echo "📝 Reading from .env file..."
    
    # Set each variable
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Remove quotes from value
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        echo "   Setting $key..."
        railway variables set "$key=$value" 2>/dev/null || echo "   ⚠️  Could not set $key"
    done < .env
    
    echo "✅ Environment variables set"
else
    echo "⚠️  No .env file found. You'll need to set variables manually in Railway dashboard"
fi

echo ""

# Set production-specific variables
echo "🔧 Setting production variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001
echo "✅ Production variables set"

echo ""

# Deploy to Railway
echo "🚀 Deploying to Railway..."
echo "   This may take a few minutes..."
railway up

echo ""

# Get the deployment URL
echo "🌐 Getting deployment URL..."
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")

if [ -n "$RAILWAY_URL" ]; then
    echo ""
    echo "=========================================="
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "=========================================="
    echo ""
    echo "🌐 Your app is live at:"
    echo "   $RAILWAY_URL"
    echo ""
    echo "📊 Health check:"
    echo "   $RAILWAY_URL/api/health"
    echo ""
    echo "🎨 Dashboard:"
    echo "   $RAILWAY_URL/epl-dashboard.html"
    echo ""
    echo "📈 Memory API:"
    echo "   $RAILWAY_URL/api/memory/performance/7d"
    echo ""
    echo "=========================================="
    echo ""
    echo "📝 Next steps:"
    echo "   1. Test health: curl $RAILWAY_URL/api/health"
    echo "   2. Open dashboard: $RAILWAY_URL/epl-dashboard.html"
    echo "   3. Update frontend API_BASE to: $RAILWAY_URL/api"
    echo "   4. Monitor logs: railway logs"
    echo ""
else
    echo "⚠️  Could not get deployment URL"
    echo "   Run 'railway domain' to get your URL"
fi

echo "🎉 Deployment complete!"
echo ""
echo "📚 Useful commands:"
echo "   railway logs        - View logs"
echo "   railway status      - Check status"
echo "   railway open        - Open in browser"
echo "   railway variables   - View environment variables"
echo ""
