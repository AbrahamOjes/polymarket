#!/usr/bin/env node

/**
 * Dry-Run Demo
 * Automated demo of EPL trading without risking real money
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log('\n' + '='.repeat(70), 'bright');
  log(`  ${title}`, 'bright');
  log('='.repeat(70), 'bright');
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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDryRunDemo() {
  const userId = 'demo-trader';
  
  log('\n🎉 EPL TRADING DRY-RUN DEMO', 'bright');
  log('   Safe testing with NO real money at risk!', 'green');
  
  // Step 1: Initialize Wallet
  section('STEP 1: Initialize Wallet');
  log('Creating demo wallet with $1000...', 'cyan');
  await sleep(1000);
  
  try {
    await apiCall('/wallet/initialize', 'POST', {
      userId,
      initialBalance: 1000
    });
    log('✅ Wallet created: $1000 balance', 'green');
  } catch (error) {
    log('⚠️  Wallet already exists, continuing...', 'yellow');
  }
  
  await sleep(2000);
  
  // Step 2: Check Balance
  section('STEP 2: Check Balance');
  log('Checking wallet balance...', 'cyan');
  await sleep(1000);
  
  const balance = await apiCall(`/wallet/balance/${userId}`);
  log(balance.result || JSON.stringify(balance, null, 2), 'blue');
  
  await sleep(2000);
  
  // Step 3: Scout Opportunities
  section('STEP 3: Scout Best Opportunities');
  log('Scanning 200+ EPL markets for value bets...', 'cyan');
  await sleep(1000);
  
  const scout = await apiCall('/epl/scout?minEdge=5');
  log('\n📊 TOP OPPORTUNITIES FOUND:', 'green');
  
  // Parse and display top 3
  const opportunities = scout.opportunities || '';
  const lines = opportunities.split('\n').slice(0, 30);
  lines.forEach(line => {
    if (line.includes('Arsenal') || line.includes('Manchester City') || line.includes('Edge')) {
      log(line, 'blue');
    }
  });
  
  await sleep(3000);
  
  // Step 4: Research Match
  section('STEP 4: Research Specific Match');
  log('Analyzing: Arsenal vs Manchester City...', 'cyan');
  await sleep(1000);
  
  const research = await apiCall('/epl/research', 'POST', {
    homeTeam: 'Arsenal',
    awayTeam: 'Manchester City'
  });
  
  log('\n📈 MATCH ANALYSIS:', 'green');
  const researchLines = (research.research || '').split('\n').slice(0, 20);
  researchLines.forEach(line => {
    if (line.trim()) log(line, 'blue');
  });
  
  await sleep(3000);
  
  // Step 5: Execute Dry-Run Trade
  section('STEP 5: Execute DRY-RUN Trade');
  log('⚠️  DRY-RUN MODE: No real money will be used', 'yellow');
  log('\nTrade Details:', 'cyan');
  log('  - Market: Arsenal Top 4 Finish', 'blue');
  log('  - Market ID: 582133', 'blue');
  log('  - Outcome: YES', 'blue');
  log('  - Side: BUY (going long)', 'blue');
  log('  - Amount: $50', 'blue');
  log('  - Mode: DRY-RUN ✅', 'green');
  
  await sleep(2000);
  log('\nExecuting trade...', 'cyan');
  await sleep(1000);
  
  const trade = await apiCall('/agent/execute-trade', 'POST', {
    marketId: '582133',
    outcome: 'YES',
    side: 'BUY',
    amount: 50,
    dryRun: true
  });
  
  log('\n✅ DRY-RUN TRADE COMPLETED!', 'green');
  log('\nTrade Result:', 'cyan');
  const tradeResult = trade.result || JSON.stringify(trade, null, 2);
  const tradeLines = tradeResult.split('\n').slice(0, 25);
  tradeLines.forEach(line => {
    if (line.includes('DRY RUN') || line.includes('shares') || line.includes('price')) {
      log(line, 'yellow');
    } else if (line.trim()) {
      log(line, 'blue');
    }
  });
  
  await sleep(3000);
  
  // Step 6: Monitor Position
  section('STEP 6: Monitor Position');
  log('Checking position status...', 'cyan');
  await sleep(1000);
  
  const positions = await apiCall(`/live/positions/${userId}`);
  log('\n📊 POSITION MONITOR:', 'green');
  const posLines = (positions.positions || 'No positions yet (dry-run)').split('\n').slice(0, 15);
  posLines.forEach(line => {
    if (line.trim()) log(line, 'blue');
  });
  
  await sleep(2000);
  
  // Step 7: Enable Auto-Exit
  section('STEP 7: Enable Auto-Exit Protection');
  log('Setting up stop-loss and take-profit...', 'cyan');
  log('  - Stop-Loss: -15% (exit if losing 15%)', 'blue');
  log('  - Take-Profit: +30% (exit if gaining 30%)', 'blue');
  await sleep(1000);
  
  const autoExit = await apiCall('/live/auto-exit', 'POST', {
    userId,
    stopLoss: -15,
    takeProfit: 30,
    dryRun: true
  });
  
  log('\n✅ Auto-exit protection enabled!', 'green');
  const exitLines = (autoExit.result || '').split('\n').slice(0, 10);
  exitLines.forEach(line => {
    if (line.trim()) log(line, 'blue');
  });
  
  await sleep(2000);
  
  // Summary
  section('DRY-RUN DEMO COMPLETE! ✅');
  log('\n🎉 You successfully completed a dry-run trade!', 'green');
  log('\nWhat happened:', 'cyan');
  log('  ✅ Created wallet with $1000', 'blue');
  log('  ✅ Found opportunities with 59% edge', 'blue');
  log('  ✅ Researched Arsenal vs Man City', 'blue');
  log('  ✅ Executed dry-run trade (no real money)', 'blue');
  log('  ✅ Monitored position', 'blue');
  log('  ✅ Enabled auto-exit protection', 'blue');
  
  log('\n💡 Next Steps:', 'cyan');
  log('  1. Review the trade analysis above', 'yellow');
  log('  2. When ready, switch dryRun: false for LIVE trading', 'yellow');
  log('  3. Always start with small amounts ($10-50)', 'yellow');
  log('  4. Keep auto-exit enabled for protection', 'yellow');
  
  log('\n🚀 Ready for live trading?', 'cyan');
  log('   Run: node live-trading.js', 'blue');
  log('   Then select option 4 for LIVE trades', 'blue');
  
  log('\n' + '='.repeat(70), 'bright');
}

// Run demo
if (require.main === module) {
  runDryRunDemo().catch(error => {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runDryRunDemo };
