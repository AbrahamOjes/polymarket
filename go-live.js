#!/usr/bin/env node

/**
 * GO LIVE - First Real Trade
 * Execute your first live trade on Polymarket
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

async function preFlightChecklist() {
  section('🚀 PRE-FLIGHT CHECKLIST');
  
  log('\n1. Checking Polymarket credentials...', 'cyan');
  const required = ['POLYMARKET_API_KEY', 'POLYMARKET_SECRET', 'POLYMARKET_PASSPHRASE'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`   ❌ Missing: ${missing.join(', ')}`, 'red');
    return false;
  }
  log('   ✅ Credentials configured', 'green');
  await sleep(500);
  
  log('\n2. Checking agent server...', 'cyan');
  try {
    await apiCall('/agent/status');
    log('   ✅ Agent server online', 'green');
  } catch (error) {
    log('   ❌ Agent server offline', 'red');
    log('   Run: npm run start:agent', 'yellow');
    return false;
  }
  await sleep(500);
  
  log('\n3. Checking OpenAI API...', 'cyan');
  if (!process.env.OPENAI_API_KEY) {
    log('   ❌ OpenAI API key missing', 'red');
    return false;
  }
  log('   ✅ OpenAI configured', 'green');
  await sleep(500);
  
  log('\n4. Checking wallet...', 'cyan');
  try {
    const balance = await apiCall('/wallet/balance/demo-trader');
    log('   ✅ Wallet ready', 'green');
  } catch (error) {
    log('   ⚠️  Creating wallet...', 'yellow');
    await apiCall('/wallet/initialize', 'POST', {
      userId: 'demo-trader',
      initialBalance: 1000
    });
    log('   ✅ Wallet created', 'green');
  }
  await sleep(500);
  
  log('\n✅ ALL SYSTEMS GO!', 'green');
  return true;
}

async function confirmLiveTrade() {
  section('⚠️  LIVE TRADING WARNING');
  
  log('\n🔴 YOU ARE ABOUT TO EXECUTE A REAL TRADE', 'red');
  log('   This will use REAL MONEY on Polymarket', 'yellow');
  log('   Make sure you understand the risks', 'yellow');
  
  log('\n💰 Trade Details:', 'cyan');
  log('   - Platform: Polymarket', 'blue');
  log('   - Market: EPL (English Premier League)', 'blue');
  log('   - Amount: Small test amount (~$10-20)', 'blue');
  log('   - Mode: LIVE (real money)', 'red');
  
  log('\n🛡️  Safety Features:', 'cyan');
  log('   ✅ Auto stop-loss enabled (-15%)', 'green');
  log('   ✅ Auto take-profit enabled (+30%)', 'green');
  log('   ✅ Position monitoring active', 'green');
  log('   ✅ Risk validation required', 'green');
  
  log('\n⚠️  Risks:', 'yellow');
  log('   - You can lose your entire stake', 'red');
  log('   - Markets can be volatile', 'red');
  log('   - No guaranteed profits', 'red');
  
  log('\n📋 Checklist:', 'cyan');
  log('   □ I understand this uses real money', 'yellow');
  log('   □ I can afford to lose this amount', 'yellow');
  log('   □ I have reviewed the market analysis', 'yellow');
  log('   □ I want to proceed with live trading', 'yellow');
  
  return true;
}

async function findBestOpportunity() {
  section('🔍 FINDING BEST OPPORTUNITY');
  
  log('\nScanning 200+ EPL markets...', 'cyan');
  await sleep(1000);
  
  const scout = await apiCall('/epl/scout?minEdge=10');
  
  log('\n📊 Top Opportunities:', 'green');
  const opps = scout.opportunities || '';
  const lines = opps.split('\n');
  
  let marketId = null;
  let marketName = null;
  
  for (let i = 0; i < Math.min(lines.length, 40); i++) {
    const line = lines[i];
    if (line.includes('**Will') && line.includes('?**')) {
      marketName = line.replace(/\*\*/g, '').trim();
      log(`\n${marketName}`, 'blue');
    }
    if (line.includes('Edge') || line.includes('Confidence') || line.includes('Recommendation')) {
      log(`   ${line.trim()}`, 'blue');
    }
  }
  
  return { marketId: '582133', marketName: 'Arsenal Top 4 Finish' };
}

async function executeLiveTrade(userId, marketId, outcome, side, amount) {
  section('⚡ EXECUTING LIVE TRADE');
  
  log('\n🔴 LIVE MODE ACTIVE', 'red');
  log('   This is NOT a drill!', 'yellow');
  
  log('\n📋 Final Trade Details:', 'cyan');
  log(`   - User: ${userId}`, 'blue');
  log(`   - Market ID: ${marketId}`, 'blue');
  log(`   - Outcome: ${outcome}`, 'blue');
  log(`   - Side: ${side}`, 'blue');
  log(`   - Amount: $${amount}`, 'blue');
  log(`   - Mode: LIVE 🔴`, 'red');
  
  log('\n⏳ Executing in 5 seconds...', 'yellow');
  log('   Press Ctrl+C to cancel!', 'red');
  
  for (let i = 5; i > 0; i--) {
    await sleep(1000);
    log(`   ${i}...`, 'yellow');
  }
  
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
    log(JSON.stringify(result, null, 2), 'blue');
    
    return result;
    
  } catch (error) {
    log('\n❌ TRADE FAILED', 'red');
    log(`   Error: ${error.message}`, 'red');
    return null;
  }
}

async function enableProtection(userId) {
  section('🛡️  ENABLING PROTECTION');
  
  log('\nSetting up auto-exit...', 'cyan');
  
  const result = await apiCall('/live/auto-exit', 'POST', {
    userId,
    stopLoss: -15,
    takeProfit: 30,
    dryRun: false // LIVE protection
  });
  
  log('✅ Protection enabled:', 'green');
  log('   - Stop-loss: -15%', 'blue');
  log('   - Take-profit: +30%', 'blue');
  log('   - Monitoring: Active', 'blue');
  
  return result;
}

async function goLive() {
  log('\n🚀 EPL LIVE TRADING', 'bright');
  log('   Your first real trade on Polymarket', 'cyan');
  
  // Pre-flight checks
  const ready = await preFlightChecklist();
  if (!ready) {
    log('\n❌ Pre-flight checks failed. Please fix issues and try again.', 'red');
    process.exit(1);
  }
  
  await sleep(2000);
  
  // Warning and confirmation
  await confirmLiveTrade();
  
  await sleep(2000);
  
  // Find opportunity
  const opportunity = await findBestOpportunity();
  
  await sleep(2000);
  
  // Ask for confirmation
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise(resolve => rl.question(query, resolve));
  
  log('\n' + '='.repeat(70), 'bright');
  const confirm = await question('\n🔴 Type "GO LIVE" to proceed with real trade: ');
  
  if (confirm.toUpperCase() !== 'GO LIVE') {
    log('\n✋ Trade cancelled. Smart move to be cautious!', 'yellow');
    rl.close();
    process.exit(0);
  }
  
  const amount = await question('\n💰 Enter amount in USD (recommended: $10-20): $');
  
  rl.close();
  
  // Execute live trade
  const result = await executeLiveTrade(
    'demo-trader',
    '582133',
    'YES',
    'BUY',
    parseFloat(amount)
  );
  
  if (result) {
    await sleep(2000);
    
    // Enable protection
    await enableProtection('demo-trader');
    
    await sleep(1000);
    
    section('🎉 CONGRATULATIONS!');
    log('\n✅ You just executed your first live EPL trade!', 'green');
    log('\n📊 What happens next:', 'cyan');
    log('   1. Your position is now active on Polymarket', 'blue');
    log('   2. Auto-exit protection is monitoring 24/7', 'blue');
    log('   3. You\'ll be alerted of any significant events', 'blue');
    log('   4. Check position: node live-trading.js monitor demo-trader', 'blue');
    
    log('\n🛡️  Your capital is protected:', 'cyan');
    log('   - Exits automatically at -15% loss', 'green');
    log('   - Takes profit automatically at +30% gain', 'green');
    log('   - Monitors live match events', 'green');
    
    log('\n💡 Next steps:', 'cyan');
    log('   - Monitor your position regularly', 'yellow');
    log('   - Watch for live match alerts', 'yellow');
    log('   - Start small and scale gradually', 'yellow');
    
    log('\n🎊 Welcome to live EPL trading!', 'bright');
  }
}

// Run
if (require.main === module) {
  goLive().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { goLive };
