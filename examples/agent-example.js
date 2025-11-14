/**
 * Example: Using the Polymarket Trading Agent
 * 
 * This script demonstrates how to use the trading agent programmatically
 */

const { mastra } = require('../src/mastra');
require('dotenv').config();

async function main() {
  console.log('🤖 Polymarket Trading Agent Example\n');

  // Get the trading agent
  const tradingAgent = mastra.getAgent('tradingAgent');
  const scannerAgent = mastra.getAgent('scannerAgent');
  const riskManager = mastra.getAgent('riskManagerAgent');

  // Example 1: Chat with the agent
  console.log('📝 Example 1: Chat with Agent');
  console.log('─'.repeat(50));
  try {
    const chatResult = await tradingAgent.generate(
      'Explain your trading strategy in 3 bullet points'
    );
    console.log(chatResult.text);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log('\n');

  // Example 2: Scan markets for opportunities
  console.log('🔍 Example 2: Scan Markets');
  console.log('─'.repeat(50));
  try {
    const scanResult = await scannerAgent.generate(
      'Scan sports markets with volume >$50K. Find the top 3 opportunities.'
    );
    console.log(scanResult.text);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log('\n');

  // Example 3: Risk analysis
  console.log('🛡️ Example 3: Portfolio Risk Check');
  console.log('─'.repeat(50));
  try {
    const riskResult = await riskManager.generate(
      'Analyze current portfolio risk and provide recommendations'
    );
    console.log(riskResult.text);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log('\n');

  // Example 4: Analyze a specific market (if you have a market ID)
  console.log('📊 Example 4: Market Analysis');
  console.log('─'.repeat(50));
  console.log('To analyze a specific market, provide a market ID:');
  console.log('const result = await tradingAgent.generate(');
  console.log('  "Analyze market 0x1234... and provide a trading recommendation"');
  console.log(');\n');

  // Example 5: Execute a trade (dry run)
  console.log('💰 Example 5: Execute Trade (Dry Run)');
  console.log('─'.repeat(50));
  console.log('To execute a trade:');
  console.log('const result = await tradingAgent.generate(`');
  console.log('  Execute a trade on market 0x1234...:');
  console.log('  - Outcome: YES');
  console.log('  - Amount: $100');
  console.log('  - Dry Run: true');
  console.log('  Analyze, validate, and execute.');
  console.log('`);\n');

  // Example 6: Autonomous trading
  console.log('🚀 Example 6: Autonomous Trading');
  console.log('─'.repeat(50));
  console.log('For autonomous trading:');
  console.log('const result = await tradingAgent.generate(`');
  console.log('  Autonomous trading session:');
  console.log('  - Max trades: 3');
  console.log('  - Max amount per trade: $100');
  console.log('  - Dry run: true');
  console.log('  Find and execute the best opportunities.');
  console.log('`);\n');

  console.log('✅ Examples completed!\n');
  console.log('💡 Tips:');
  console.log('  - Always use dry-run mode for testing');
  console.log('  - Start with small amounts');
  console.log('  - Monitor agent decisions carefully');
  console.log('  - Review the reasoning behind each trade\n');
}

// Run the examples
main().catch(console.error);
