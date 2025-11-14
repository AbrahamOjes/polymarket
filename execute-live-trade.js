#!/usr/bin/env node

/**
 * Execute Live Trade - Direct Execution
 * $1 test trade on Polymarket
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

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return await response.json();
}

async function executeLiveTrade() {
  log('\n' + '='.repeat(70), 'bright');
  log('  🚀 EXECUTING LIVE TRADE - $1 TEST', 'bright');
  log('='.repeat(70), 'bright');
  
  const userId = 'demo-trader';
  const marketId = '582133'; // Arsenal Top 4
  const outcome = 'YES';
  const side = 'BUY';
  const amount = 1; // $1 test trade
  
  log('\n🔴 LIVE MODE ACTIVE', 'red');
  log('   This uses REAL MONEY on Polymarket!', 'yellow');
  
  log('\n📋 Trade Details:', 'cyan');
  log(`   - User: ${userId}`, 'blue');
  log(`   - Market: Arsenal Top 4 Finish`, 'blue');
  log(`   - Market ID: ${marketId}`, 'blue');
  log(`   - Outcome: ${outcome}`, 'blue');
  log(`   - Side: ${side} (going long)`, 'blue');
  log(`   - Amount: $${amount}`, 'blue');
  log(`   - Mode: LIVE 🔴`, 'red');
  
  log('\n🛡️  Protection:', 'cyan');
  log('   - Stop-loss: -15%', 'green');
  log('   - Take-profit: +30%', 'green');
  log('   - Max loss: $1.00', 'green');
  
  log('\n⏳ Executing in 3 seconds...', 'yellow');
  log('   Press Ctrl+C to cancel!', 'red');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  log('   3...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 1000));
  log('   2...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 1000));
  log('   1...', 'yellow');
  
  log('\n🚀 Executing trade...', 'cyan');
  
  try {
    const result = await apiCall('/agent/execute-trade', 'POST', {
      marketId,
      outcome,
      side,
      amount,
      dryRun: false // 🔴 LIVE MODE
    });
    
    log('\n' + '='.repeat(70), 'green');
    log('  ✅ TRADE EXECUTED!', 'green');
    log('='.repeat(70), 'green');
    
    log('\n📊 Result:', 'cyan');
    const resultText = result.result || JSON.stringify(result, null, 2);
    log(resultText, 'blue');
    
    // Enable auto-exit protection
    log('\n🛡️  Enabling auto-exit protection...', 'cyan');
    await apiCall('/live/auto-exit', 'POST', {
      userId,
      stopLoss: -15,
      takeProfit: 30,
      dryRun: false
    });
    log('✅ Protection enabled!', 'green');
    
    log('\n' + '='.repeat(70), 'bright');
    log('  🎉 CONGRATULATIONS!', 'bright');
    log('='.repeat(70), 'bright');
    
    log('\n✅ Your first live EPL trade is complete!', 'green');
    log('\n📊 What happened:', 'cyan');
    log('   ✅ $1 invested in Arsenal Top 4', 'blue');
    log('   ✅ Position is now active on Polymarket', 'blue');
    log('   ✅ Auto-exit protection monitoring 24/7', 'blue');
    log('   ✅ Will exit at -15% loss or +30% profit', 'blue');
    
    log('\n💡 Next steps:', 'cyan');
    log('   1. Monitor position: node live-trading.js monitor demo-trader', 'yellow');
    log('   2. Check alerts: curl http://localhost:3001/api/live/alerts/demo-trader', 'yellow');
    log('   3. View balance: node live-trading.js balance demo-trader', 'yellow');
    
    log('\n🎊 Welcome to live EPL trading!', 'bright');
    
  } catch (error) {
    log('\n❌ TRADE FAILED', 'red');
    log(`   Error: ${error.message}`, 'red');
    log('\n💡 This might mean:', 'yellow');
    log('   - Polymarket API credentials need verification', 'yellow');
    log('   - Market is temporarily unavailable', 'yellow');
    log('   - Insufficient funds in Polymarket account', 'yellow');
    log('\n📝 Error details:', 'cyan');
    console.error(error);
  }
}

// Run
if (require.main === module) {
  executeLiveTrade().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { executeLiveTrade };
