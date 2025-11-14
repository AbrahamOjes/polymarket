/**
 * Evaluation Runner
 * Run agent evaluations to check for hallucinations and accuracy
 */

const { runEvaluations, hallucinationChecks, startContinuousMonitoring } = require('./src/mastra/evals/epl-agent-evals');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'run';

async function main() {
  console.log('🧪 EPL Agent Evaluation System\n');
  
  switch (command) {
    case 'run':
      // Run all evaluations once
      await runEvaluations();
      break;
      
    case 'monitor':
      // Start continuous monitoring
      const interval = parseInt(args[1]) || 60;
      await startContinuousMonitoring(interval);
      break;
      
    case 'hallucination':
      // Run specific hallucination checks
      console.log('🔍 Running Hallucination Checks\n');
      
      console.log('1. Statistics Hallucination Check...');
      const statsCheck = await hallucinationChecks.checkStatisticsHallucination();
      console.log(`   ${statsCheck.passed ? '✅' : '❌'} ${statsCheck.message}\n`);
      
      console.log('2. Team Confusion Check...');
      const teamCheck = await hallucinationChecks.checkTeamConfusion();
      console.log(`   ${teamCheck.passed ? '✅' : '❌'} ${teamCheck.message}\n`);
      
      console.log('3. Guarantee Hallucination Check...');
      const guaranteeCheck = await hallucinationChecks.checkGuaranteeHallucination();
      console.log(`   ${guaranteeCheck.passed ? '✅' : '❌'} ${guaranteeCheck.message}\n`);
      break;
      
    case 'help':
    default:
      console.log('Usage: node run-evals.js [command] [options]\n');
      console.log('Commands:');
      console.log('  run              Run all evaluations once');
      console.log('  monitor [mins]   Start continuous monitoring (default: 60 minutes)');
      console.log('  hallucination    Run specific hallucination checks');
      console.log('  help             Show this help message');
      console.log('\nExamples:');
      console.log('  node run-evals.js run');
      console.log('  node run-evals.js monitor 30');
      console.log('  node run-evals.js hallucination');
      break;
  }
}

main().catch(error => {
  console.error('❌ Error running evaluations:', error);
  process.exit(1);
});
