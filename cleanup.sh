#!/bin/bash

# EPL Trading Agent - Project Cleanup Script
# Removes unnecessary files and keeps only EPL-focused implementation

echo "🧹 Cleaning up project - Keeping only EPL trading implementation..."

# Create archive folder for old files
mkdir -p archive/old-ui
mkdir -p archive/old-docs
mkdir -p archive/old-servers

# Move old UI files to archive
echo "📦 Archiving old UI files..."
mv index.html archive/old-ui/ 2>/dev/null
mv sports.html archive/old-ui/ 2>/dev/null
mv sports-live.html archive/old-ui/ 2>/dev/null
mv agent-dashboard.html archive/old-ui/ 2>/dev/null
mv agent-dashboard-v2.html archive/old-ui/ 2>/dev/null

# Move old documentation to archive
echo "📦 Archiving old documentation..."
mv IMPLEMENTATION.md archive/old-docs/ 2>/dev/null
mv ux-to-ui-application-guide.md archive/old-docs/ 2>/dev/null
mv COMPLETE-UX-UI-RESEARCH.md archive/old-docs/ 2>/dev/null
mv information-markets-positioning.md archive/old-docs/ 2>/dev/null
mv research-backed-ux-framework.md archive/old-docs/ 2>/dev/null
mv advanced-ui-specifications.md archive/old-docs/ 2>/dev/null
mv implementation-roadmap.md archive/old-docs/ 2>/dev/null
mv SETUP.md archive/old-docs/ 2>/dev/null
mv SDK-SETUP.md archive/old-docs/ 2>/dev/null
mv AGENT-SUMMARY.md archive/old-docs/ 2>/dev/null
mv CONTEXT-AWARE-TRADING.md archive/old-docs/ 2>/dev/null

# Move old servers to archive
echo "📦 Archiving old server files..."
mv server.js archive/old-servers/ 2>/dev/null
mv server-sdk.js archive/old-servers/ 2>/dev/null
mv server-polymarket.js archive/old-servers/ 2>/dev/null

# Remove old agent files (non-EPL)
echo "🗑️  Removing non-EPL agent files..."
rm -f src/mastra/agents/trading-agent.js 2>/dev/null
rm -f src/mastra/agents/context-aware-agent.js 2>/dev/null

# Remove old tools (non-EPL)
echo "🗑️  Removing non-EPL tools..."
rm -f src/mastra/tools/context-tools.js 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "📁 Project structure:"
echo "  ✅ agent-server.js - Main EPL trading server"
echo "  ✅ run-evals.js - Agent evaluation system"
echo "  ✅ src/mastra/agents/epl-agents.js - EPL specialist agents"
echo "  ✅ src/mastra/agents/live-trading-agent.js - Live match monitoring"
echo "  ✅ src/mastra/tools/epl-tools.js - EPL analysis tools"
echo "  ✅ src/mastra/tools/wallet-tools.js - Wallet management"
echo "  ✅ src/mastra/tools/live-monitoring-tools.js - Real-time monitoring"
echo "  ✅ EPL-TRADING-GUIDE.md - Main documentation"
echo "  ✅ AGENT-EVALS-GUIDE.md - Evaluation documentation"
echo ""
echo "📦 Archived files moved to ./archive/"
