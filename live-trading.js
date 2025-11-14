#!/usr/bin/env node

/**
 * Live Trading Script
 * Execute real trades on Polymarket EPL markets
 */

require('dotenv').config();

const API_BASE = 'http://localhost:3001/api';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

async function checkCredentials() {
  log('\n🔐 Checking Polymarket Credentials...', 'cyan');
  
  const required = ['POLYMARKET_API_KEY', 'POLYMARKET_SECRET', 'POLYMARKET_PASSPHRASE'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`\n❌ Missing credentials: ${missing.join(', ')}`, 'red');
    log('\nPlease add them to your .env file:', 'yellow');
    log('POLYMARKET_API_KEY=your_key_here', 'yellow');
    log('POLYMARKET_SECRET=your_secret_here', 'yellow');
    log('POLYMARKET_PASSPHRASE=your_passphrase_here', 'yellow');
    return false;
  }
  
  log('✅ All credentials configured', 'green');
  return true;
}

async function checkAgentStatus() {
  log('\n🤖 Checking Agent Status...', 'cyan');
  
  try {
    const status = await apiCall('/agent/status');
    log(`✅ Agent server online`, 'green');
    log(`   - ${status.agents?.length || 0} agents active`, 'blue');
    return true;
  } catch (error) {
    log('❌ Agent server offline', 'red');
    log('   Please start it with: npm run start:agent', 'yellow');
    return false;
  }
}

async function initializeWallet(userId, initialBalance) {
  log(`\n💰 Initializing Wallet for ${userId}...`, 'cyan');
  
  try {
    const result = await apiCall('/wallet/initialize', 'POST', {
      userId,
      initialBalance
    });
    
    log(`✅ Wallet created`, 'green');
    log(`   - User: ${userId}`, 'blue');
    log(`   - Balance: $${initialBalance}`, 'blue');
    return true;
  } catch (error) {
    log(`⚠️  Wallet may already exist: ${error.message}`, 'yellow');
    return true;
  }
}

async function checkBalance(userId) {
  log(`\n💳 Checking Balance for ${userId}...`, 'cyan');
  
  try {
    const result = await apiCall(`/wallet/balance/${userId}`);
    log(result.result || JSON.stringify(result, null, 2), 'blue');
    return true;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

async function scoutOpportunities(minEdge = 5) {
  log(`\n🔍 Scouting EPL Markets (min edge: ${minEdge}%)...`, 'cyan');
  
  try {
    const result = await apiCall(`/epl/scout?minEdge=${minEdge}`);
    log(result.opportunities || JSON.stringify(result, null, 2), 'blue');
    return result;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function researchMatch(homeTeam, awayTeam) {
  log(`\n📊 Researching: ${homeTeam} vs ${awayTeam}...`, 'cyan');
  
  try {
    const result = await apiCall('/epl/research', 'POST', {
      homeTeam,
      awayTeam
    });
    log(result.research || JSON.stringify(result, null, 2), 'blue');
    return result;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function executeTrade(userId, marketId, outcome, side, amount, dryRun = true) {
  const mode = dryRun ? 'DRY-RUN' : 'LIVE';
  log(`\n⚡ Executing ${mode} Trade...`, dryRun ? 'yellow' : 'red');
  log(`   - User: ${userId}`, 'blue');
  log(`   - Market: ${marketId}`, 'blue');
  log(`   - Side: ${side} ${outcome}`, 'blue');
  log(`   - Amount: $${amount}`, 'blue');
  
  if (!dryRun) {
    log('\n⚠️  WARNING: This is a REAL trade with REAL money!', 'red');
    log('   Press Ctrl+C to cancel...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  try {
    const result = await apiCall('/agent/execute-trade', 'POST', {
      marketId,
      outcome,
      side,
      amount,
      dryRun
    });
    
    if (result.success || result.result) {
      log(`\n✅ Trade ${dryRun ? 'simulated' : 'executed'} successfully!`, 'green');
      log(result.result || JSON.stringify(result, null, 2), 'blue');
    } else {
      log(`\n❌ Trade failed`, 'red');
      log(result.error || JSON.stringify(result, null, 2), 'red');
    }
    
    return result;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function monitorPositions(userId) {
  log(`\n📊 Monitoring Positions for ${userId}...`, 'cyan');
  
  try {
    const result = await apiCall(`/live/positions/${userId}`);
    log(result.positions || JSON.stringify(result, null, 2), 'blue');
    return result;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function enableAutoExit(userId, stopLoss = -15, takeProfit = 30, dryRun = true) {
  log(`\n🛡️  Enabling Auto-Exit Protection...`, 'cyan');
  log(`   - Stop-Loss: ${stopLoss}%`, 'blue');
  log(`   - Take-Profit: ${takeProfit}%`, 'blue');
  log(`   - Mode: ${dryRun ? 'DRY-RUN' : 'LIVE'}`, dryRun ? 'yellow' : 'red');
  
  try {
    const result = await apiCall('/live/auto-exit', 'POST', {
      userId,
      stopLoss,
      takeProfit,
      dryRun
    });
    
    log(`\n✅ Auto-exit configured`, 'green');
    log(result.result || JSON.stringify(result, null, 2), 'blue');
    return result;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
}

// Interactive menu
async function showMenu() {
  log('\n' + '='.repeat(60), 'bright');
  log('⚽ EPL LIVE TRADING MENU', 'bright');
  log('='.repeat(60), 'bright');
  log('\n1. 🔍 Scout Opportunities', 'cyan');
  log('2. 📊 Research Match', 'cyan');
  log('3. ⚡ Execute Trade (DRY-RUN)', 'yellow');
  log('4. 🔥 Execute Trade (LIVE)', 'red');
  log('5. 💳 Check Balance', 'cyan');
  log('6. 📈 Monitor Positions', 'cyan');
  log('7. 🛡️  Enable Auto-Exit', 'cyan');
  log('8. 🚪 Exit', 'cyan');
  log('\n' + '='.repeat(60), 'bright');
}

// Main interactive mode
async function interactiveMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  log('\n🎉 Welcome to EPL Live Trading!', 'bright');
  
  // Pre-flight checks
  const hasCredentials = await checkCredentials();
  if (!hasCredentials) {
    process.exit(1);
  }
  
  const agentOnline = await checkAgentStatus();
  if (!agentOnline) {
    process.exit(1);
  }

  // Get user ID
  const userId = await question('\n👤 Enter your User ID: ');
  
  // Initialize wallet if needed
  const initWallet = await question('💰 Initialize wallet? (y/n): ');
  if (initWallet.toLowerCase() === 'y') {
    const balance = await question('   Initial balance ($): ');
    await initializeWallet(userId, parseInt(balance));
  }

  // Main loop
  while (true) {
    await showMenu();
    const choice = await question('\nSelect option (1-8): ');

    switch (choice) {
      case '1':
        const minEdge = await question('Min edge % (default 5): ') || '5';
        await scoutOpportunities(parseInt(minEdge));
        break;

      case '2':
        const homeTeam = await question('Home team: ');
        const awayTeam = await question('Away team: ');
        await researchMatch(homeTeam, awayTeam);
        break;

      case '3':
      case '4':
        const marketId = await question('Market ID: ');
        const outcome = await question('Outcome (YES/NO): ');
        const side = await question('Side (BUY/SELL): ');
        const amount = await question('Amount ($): ');
        const dryRun = choice === '3';
        await executeTrade(userId, marketId, outcome.toUpperCase(), side.toUpperCase(), parseFloat(amount), dryRun);
        break;

      case '5':
        await checkBalance(userId);
        break;

      case '6':
        await monitorPositions(userId);
        break;

      case '7':
        const stopLoss = await question('Stop-loss % (default -15): ') || '-15';
        const takeProfit = await question('Take-profit % (default 30): ') || '30';
        const autoMode = await question('Live mode? (y/n): ');
        await enableAutoExit(userId, parseInt(stopLoss), parseInt(takeProfit), autoMode.toLowerCase() !== 'y');
        break;

      case '8':
        log('\n👋 Goodbye! Happy trading!', 'green');
        rl.close();
        process.exit(0);

      default:
        log('Invalid option', 'red');
    }

    await question('\nPress Enter to continue...');
  }
}

// Command line mode
async function commandLineMode() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    return interactiveMode();
  }

  const userId = args[1] || 'demo-user';

  switch (command) {
    case 'scout':
      await scoutOpportunities(parseInt(args[2]) || 5);
      break;

    case 'research':
      await researchMatch(args[2], args[3]);
      break;

    case 'trade':
      await executeTrade(userId, args[2], args[3], args[4], parseFloat(args[5]), args[6] !== 'live');
      break;

    case 'balance':
      await checkBalance(userId);
      break;

    case 'monitor':
      await monitorPositions(userId);
      break;

    case 'help':
      log('\n⚽ EPL Live Trading CLI', 'bright');
      log('\nUsage:', 'cyan');
      log('  node live-trading.js                    # Interactive mode', 'blue');
      log('  node live-trading.js scout [minEdge]    # Scout opportunities', 'blue');
      log('  node live-trading.js research <home> <away>  # Research match', 'blue');
      log('  node live-trading.js balance <userId>   # Check balance', 'blue');
      log('  node live-trading.js monitor <userId>   # Monitor positions', 'blue');
      log('\nExamples:', 'cyan');
      log('  node live-trading.js scout 10', 'blue');
      log('  node live-trading.js research Arsenal "Man City"', 'blue');
      log('  node live-trading.js balance myuser', 'blue');
      break;

    default:
      log(`Unknown command: ${command}`, 'red');
      log('Run "node live-trading.js help" for usage', 'yellow');
  }
}

// Run
if (require.main === module) {
  commandLineMode().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  scoutOpportunities,
  researchMatch,
  executeTrade,
  monitorPositions,
  enableAutoExit
};
