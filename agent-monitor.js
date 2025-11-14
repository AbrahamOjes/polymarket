#!/usr/bin/env node

/**
 * Agent Monitor - Continuous Opportunity Scanner
 * Keeps agent online and scanning for opportunities at intervals
 */

require('dotenv').config();

const API_BASE = 'http://localhost:3001/api';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return await response.json();
}

class AgentMonitor {
  constructor(config = {}) {
    this.config = {
      scanInterval: config.scanInterval || 5 * 60 * 1000, // 5 minutes
      healthCheckInterval: config.healthCheckInterval || 60 * 1000, // 1 minute
      minEdge: config.minEdge || 10,
      minConfidence: config.minConfidence || 70,
      autoTrade: config.autoTrade || false,
      maxTradeAmount: config.maxTradeAmount || 10,
      userId: config.userId || 'demo-trader'
    };
    
    this.isRunning = false;
    this.scanCount = 0;
    this.opportunitiesFound = 0;
    this.tradesExecuted = 0;
    this.lastScanTime = null;
    this.agentStatus = 'unknown';
  }

  async start() {
    log('🚀 Starting Agent Monitor...', 'bright');
    log(`   - Scan interval: ${this.config.scanInterval / 1000}s`, 'cyan');
    log(`   - Health check: ${this.config.healthCheckInterval / 1000}s`, 'cyan');
    log(`   - Min edge: ${this.config.minEdge}%`, 'cyan');
    log(`   - Min confidence: ${this.config.minConfidence}%`, 'cyan');
    log(`   - Auto-trade: ${this.config.autoTrade ? 'ENABLED 🔴' : 'DISABLED ✅'}`, this.config.autoTrade ? 'red' : 'green');
    
    this.isRunning = true;
    
    // Start health check loop
    this.healthCheckLoop();
    
    // Start opportunity scan loop
    this.scanLoop();
    
    log('✅ Agent Monitor is now running!', 'green');
    log('   Press Ctrl+C to stop', 'yellow');
  }

  async stop() {
    log('🛑 Stopping Agent Monitor...', 'yellow');
    this.isRunning = false;
    log('✅ Agent Monitor stopped', 'green');
  }

  async healthCheckLoop() {
    while (this.isRunning) {
      await this.checkAgentHealth();
      await this.sleep(this.config.healthCheckInterval);
    }
  }

  async scanLoop() {
    while (this.isRunning) {
      await this.scanForOpportunities();
      await this.sleep(this.config.scanInterval);
    }
  }

  async checkAgentHealth() {
    try {
      const status = await apiCall('/agent/status');
      
      if (this.agentStatus !== 'online') {
        log('✅ Agent is ONLINE', 'green');
        this.agentStatus = 'online';
      }
      
      return true;
    } catch (error) {
      if (this.agentStatus !== 'offline') {
        log('❌ Agent is OFFLINE', 'red');
        log('   Please start: npm run start:agent', 'yellow');
        this.agentStatus = 'offline';
      }
      return false;
    }
  }

  async scanForOpportunities() {
    this.scanCount++;
    this.lastScanTime = new Date();
    
    log(`🔍 Scan #${this.scanCount}: Checking for opportunities...`, 'cyan');
    
    try {
      const result = await apiCall(`/epl/scout?minEdge=${this.config.minEdge}`);
      const opportunities = this.parseOpportunities(result.opportunities);
      
      if (opportunities.length === 0) {
        log('   No opportunities found meeting criteria', 'yellow');
        return;
      }
      
      log(`   ✅ Found ${opportunities.length} opportunities!`, 'green');
      this.opportunitiesFound += opportunities.length;
      
      // Display opportunities
      opportunities.forEach((opp, index) => {
        log(`   ${index + 1}. ${opp.market}`, 'blue');
        log(`      Edge: ${opp.edge}% | Confidence: ${opp.confidence}%`, 'blue');
        
        // Check if meets criteria for auto-trade
        if (this.config.autoTrade && 
            opp.confidence >= this.config.minConfidence &&
            opp.edge >= this.config.minEdge) {
          log(`      🎯 MEETS AUTO-TRADE CRITERIA!`, 'green');
          this.executeAutoTrade(opp);
        }
      });
      
    } catch (error) {
      log(`   ❌ Scan failed: ${error.message}`, 'red');
    }
  }

  parseOpportunities(text) {
    if (!text) return [];
    
    const opportunities = [];
    const lines = text.split('\n');
    let currentOpp = null;
    
    for (const line of lines) {
      // Match market name
      if (line.includes('**Will') || line.includes('**Match')) {
        if (currentOpp) opportunities.push(currentOpp);
        currentOpp = {
          market: line.replace(/\*\*/g, '').trim(),
          edge: 0,
          confidence: 0
        };
      }
      
      // Match edge
      if (line.includes('Edge') && currentOpp) {
        const match = line.match(/(\d+\.?\d*)%/);
        if (match) currentOpp.edge = parseFloat(match[1]);
      }
      
      // Match confidence
      if (line.includes('Confidence') && currentOpp) {
        const match = line.match(/(\d+)/);
        if (match) currentOpp.confidence = parseInt(match[1]);
      }
    }
    
    if (currentOpp) opportunities.push(currentOpp);
    
    return opportunities.filter(o => 
      o.edge >= this.config.minEdge && 
      o.confidence >= this.config.minConfidence
    );
  }

  async executeAutoTrade(opportunity) {
    log(`   🚀 Attempting auto-trade: ${opportunity.market}`, 'magenta');
    
    try {
      // This would execute the trade
      // For safety, we'll just log it unless explicitly enabled
      if (this.config.autoTrade === 'LIVE') {
        log(`   ⚠️  AUTO-TRADE LIVE MODE - Executing real trade!`, 'red');
        // Execute real trade here
        this.tradesExecuted++;
      } else {
        log(`   ✅ Auto-trade in DRY-RUN mode (no real trade)`, 'yellow');
      }
    } catch (error) {
      log(`   ❌ Auto-trade failed: ${error.message}`, 'red');
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      agentStatus: this.agentStatus,
      scanCount: this.scanCount,
      opportunitiesFound: this.opportunitiesFound,
      tradesExecuted: this.tradesExecuted,
      lastScanTime: this.lastScanTime,
      uptime: this.lastScanTime ? Date.now() - this.lastScanTime.getTime() : 0
    };
  }

  displayStats() {
    const stats = this.getStats();
    log('\n📊 Monitor Statistics:', 'bright');
    log(`   - Status: ${stats.agentStatus}`, stats.agentStatus === 'online' ? 'green' : 'red');
    log(`   - Scans completed: ${stats.scanCount}`, 'cyan');
    log(`   - Opportunities found: ${stats.opportunitiesFound}`, 'cyan');
    log(`   - Trades executed: ${stats.tradesExecuted}`, 'cyan');
    log(`   - Last scan: ${stats.lastScanTime?.toLocaleTimeString() || 'Never'}`, 'cyan');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const config = {
    scanInterval: parseInt(args[0]) || 5 * 60 * 1000, // Default 5 minutes
    minEdge: parseInt(args[1]) || 10,
    minConfidence: parseInt(args[2]) || 70,
    autoTrade: args[3] === 'true' || false
  };
  
  const monitor = new AgentMonitor(config);
  
  // Handle Ctrl+C
  process.on('SIGINT', async () => {
    log('\n\n🛑 Received stop signal...', 'yellow');
    await monitor.stop();
    monitor.displayStats();
    process.exit(0);
  });
  
  // Display stats every 30 seconds
  setInterval(() => {
    if (monitor.isRunning) {
      monitor.displayStats();
    }
  }, 30000);
  
  await monitor.start();
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { AgentMonitor };
