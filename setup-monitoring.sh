#!/bin/bash

# Setup 24/7 Monitoring for EPL Trading Agent

echo "🚀 Setting up EPL Agent Monitoring..."
echo ""

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs
echo "✅ Logs directory created"
echo ""

# Check if PM2 is installed
echo "🔍 Checking for PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 not found. Installing..."
    npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi
echo ""

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x agent-monitor.js
chmod +x live-trading.js
chmod +x go-live.js
chmod +x execute-live-trade.js
echo "✅ Scripts are now executable"
echo ""

# Test agent server
echo "🧪 Testing agent server..."
if curl -s http://localhost:3001/api/agent/status > /dev/null 2>&1; then
    echo "✅ Agent server is running"
else
    echo "⚠️  Agent server not running"
    echo "   Start it with: npm run start:agent"
fi
echo ""

# Display options
echo "=========================================="
echo "  📊 Monitoring Setup Complete!"
echo "=========================================="
echo ""
echo "Choose your monitoring strategy:"
echo ""
echo "1️⃣  Manual Monitoring (Development)"
echo "   node agent-monitor.js"
echo ""
echo "2️⃣  PM2 Process Manager (Production)"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 logs"
echo ""
echo "3️⃣  Custom Intervals"
echo "   node agent-monitor.js 60000 10 70 false"
echo "   (1min, 10% edge, 70% confidence)"
echo ""
echo "=========================================="
echo ""
echo "📖 Full guide: cat MONITORING-GUIDE.md"
echo ""
