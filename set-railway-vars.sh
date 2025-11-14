#!/bin/bash

# Set Railway Environment Variables
# This script reads from .env and sets variables in Railway

echo "🔧 Setting Railway Environment Variables..."
echo ""

# Read variables from .env
OPENAI_KEY=$(grep '^OPENAI_API_KEY=' .env | cut -d '=' -f2-)
POLY_KEY=$(grep '^POLYMARKET_API_KEY=' .env | cut -d '=' -f2-)
POLY_SECRET=$(grep '^POLYMARKET_SECRET=' .env | cut -d '=' -f2-)
POLY_PASS=$(grep '^POLYMARKET_PASSPHRASE=' .env | cut -d '=' -f2-)

# Check if variables are set
if [ -z "$OPENAI_KEY" ]; then
    echo "❌ OPENAI_API_KEY not found in .env"
    exit 1
fi

if [ -z "$POLY_KEY" ]; then
    echo "❌ POLYMARKET_API_KEY not found in .env"
    exit 1
fi

echo "✅ Found all required variables in .env"
echo ""

# Set variables in Railway
echo "Setting OPENAI_API_KEY..."
railway variables --set "OPENAI_API_KEY=$OPENAI_KEY"

echo "Setting POLYMARKET_API_KEY..."
railway variables --set "POLYMARKET_API_KEY=$POLY_KEY"

echo "Setting POLYMARKET_SECRET..."
railway variables --set "POLYMARKET_SECRET=$POLY_SECRET"

echo "Setting POLYMARKET_PASSPHRASE..."
railway variables --set "POLYMARKET_PASSPHRASE=$POLY_PASS"

echo "Setting NODE_ENV..."
railway variables --set "NODE_ENV=production"

echo "Setting PORT..."
railway variables --set "PORT=3001"

echo ""
echo "✅ All environment variables set!"
echo ""
echo "🚀 Ready to deploy. Run: railway up"
