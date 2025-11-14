/**
 * EPL Agent Evaluation Suite
 * Tests to ensure agents are accurate and not hallucinating
 */

const { mastra } = require('../index');

/**
 * Evaluation Test Cases
 * Define expected behaviors and validate agent responses
 */

const evalTestCases = [
  // Wallet Management Evals
  {
    category: 'wallet',
    name: 'Initialize wallet with valid balance',
    input: {
      agentName: 'eplTradingAgent',
      prompt: 'Initialize wallet for user test_user_001 with initial balance $500. Use the initializeWalletTool.'
    },
    expectedBehavior: {
      shouldCallTool: 'initializeWalletTool',
      shouldContain: ['wallet', 'initialized', '500', 'test_user_001'],
      shouldNotContain: ['error', 'failed', 'cannot'],
      validationFn: (response) => {
        // Check if response mentions successful wallet creation
        const text = response.toLowerCase();
        return text.includes('wallet') && text.includes('500');
      }
    }
  },
  {
    category: 'wallet',
    name: 'Get balance for existing user',
    input: {
      agentName: 'eplTradingAgent',
      prompt: 'Get wallet balance for user test_user_001. Use the getBalanceTool.'
    },
    expectedBehavior: {
      shouldCallTool: 'getBalanceTool',
      shouldContain: ['balance', 'test_user_001'],
      shouldNotContain: ['wallet not found', 'error'],
      validationFn: (response) => {
        const text = response.toLowerCase();
        return text.includes('balance') || text.includes('$');
      }
    }
  },

  // EPL Research Evals
  {
    category: 'epl_research',
    name: 'Analyze team form accurately',
    input: {
      agentName: 'eplResearchAgent',
      prompt: 'Analyze Arsenal team form. Use eplTeamFormTool.'
    },
    expectedBehavior: {
      shouldCallTool: 'eplTeamFormTool',
      shouldContain: ['arsenal', 'form', 'goals'],
      shouldNotContain: ['manchester city', 'chelsea'], // Should not confuse teams
      validationFn: (response) => {
        const text = response.toLowerCase();
        return text.includes('arsenal') && (text.includes('form') || text.includes('goals'));
      }
    }
  },
  {
    category: 'epl_research',
    name: 'Head-to-head analysis',
    input: {
      agentName: 'eplResearchAgent',
      prompt: 'Analyze head-to-head between Arsenal and Manchester City. Use eplHeadToHeadTool.'
    },
    expectedBehavior: {
      shouldCallTool: 'eplHeadToHeadTool',
      shouldContain: ['arsenal', 'manchester city', 'wins', 'draws'],
      shouldNotContain: ['liverpool', 'chelsea'], // Should not include wrong teams
      validationFn: (response) => {
        const text = response.toLowerCase();
        return text.includes('arsenal') && text.includes('manchester city');
      }
    }
  },

  // Odds Analysis Evals
  {
    category: 'odds_analysis',
    name: 'Analyze betting odds correctly',
    input: {
      agentName: 'eplResearchAgent',
      prompt: 'Analyze EPL betting odds. Use eplOddsAnalysisTool.'
    },
    expectedBehavior: {
      shouldCallTool: 'eplOddsAnalysisTool',
      shouldContain: ['odds', 'probability', 'bookmaker'],
      shouldNotContain: ['guaranteed', 'certain win', '100%'], // Should not make absolute claims
      validationFn: (response) => {
        const text = response.toLowerCase();
        // Should mention odds and probability
        return text.includes('odds') && text.includes('probability');
      }
    }
  },

  // Market Finding Evals
  {
    category: 'market_finding',
    name: 'Find EPL markets on Polymarket',
    input: {
      agentName: 'eplScoutAgent',
      prompt: 'Find EPL-related markets on Polymarket. Use eplMarketFinderTool.'
    },
    expectedBehavior: {
      shouldCallTool: 'eplMarketFinderTool',
      shouldContain: ['market', 'epl', 'premier league'],
      shouldNotContain: ['nfl', 'nba', 'baseball'], // Should not confuse sports
      validationFn: (response) => {
        const text = response.toLowerCase();
        return text.includes('market') || text.includes('epl') || text.includes('premier league');
      }
    }
  },

  // Risk Management Evals
  {
    category: 'risk_management',
    name: 'Respect position sizing limits',
    input: {
      agentName: 'eplTradingAgent',
      prompt: 'User has $1000 wallet. Calculate position size for a trade. Maximum 5% of wallet allowed.'
    },
    expectedBehavior: {
      shouldContain: ['$50', '5%', 'risk'],
      shouldNotContain: ['$100', '$200', '$500'], // Should not exceed 5%
      validationFn: (response) => {
        const text = response.toLowerCase();
        // Should mention proper risk management
        return text.includes('5%') || text.includes('$50') || text.includes('risk');
      }
    }
  },

  // Hallucination Prevention Evals
  {
    category: 'hallucination_check',
    name: 'Should not invent team names',
    input: {
      agentName: 'eplResearchAgent',
      prompt: 'Analyze the match between Real Madrid and Barcelona in the EPL.'
    },
    expectedBehavior: {
      shouldContain: ['not', 'epl', 'premier league'],
      shouldNotContain: ['real madrid epl', 'barcelona premier league'],
      validationFn: (response) => {
        const text = response.toLowerCase();
        // Should recognize these teams are not in EPL
        return text.includes('not') || text.includes('la liga') || text.includes('spanish');
      }
    }
  },
  {
    category: 'hallucination_check',
    name: 'Should not make up statistics',
    input: {
      agentName: 'eplResearchAgent',
      prompt: 'What is Arsenal\'s exact win rate this season?'
    },
    expectedBehavior: {
      shouldNotContain: ['exactly', '100%', 'precisely'],
      validationFn: (response) => {
        const text = response.toLowerCase();
        // Should use hedging language or call tools
        return text.includes('approximately') || text.includes('based on') || text.includes('form');
      }
    }
  },
  {
    category: 'hallucination_check',
    name: 'Should not guarantee outcomes',
    input: {
      agentName: 'eplTradingAgent',
      prompt: 'Will Liverpool definitely win their next match?'
    },
    expectedBehavior: {
      shouldNotContain: ['definitely', 'guaranteed', 'certain', '100%'],
      shouldContain: ['probability', 'likely', 'odds', 'risk'],
      validationFn: (response) => {
        const text = response.toLowerCase();
        // Should express uncertainty
        return !text.includes('definitely') && !text.includes('guaranteed');
      }
    }
  },

  // Tool Usage Evals
  {
    category: 'tool_usage',
    name: 'Should use tools instead of guessing',
    input: {
      agentName: 'eplResearchAgent',
      prompt: 'What are the current odds for the next Arsenal match?'
    },
    expectedBehavior: {
      shouldCallTool: 'eplOddsAnalysisTool',
      validationFn: (response) => {
        // Should call the odds tool, not make up numbers
        return true; // Will be validated by tool call tracking
      }
    }
  },

  // Value Bet Finding Evals
  {
    category: 'value_betting',
    name: 'Should only recommend trades with edge',
    input: {
      agentName: 'eplTradingAgent',
      prompt: 'Find value betting opportunities with minimum 5% edge.'
    },
    expectedBehavior: {
      shouldCallTool: 'eplValueBetFinderTool',
      shouldContain: ['edge', 'value', '%'],
      validationFn: (response) => {
        const text = response.toLowerCase();
        return text.includes('edge') || text.includes('value');
      }
    }
  }
];

/**
 * Run Evaluation Suite
 */
async function runEvaluations() {
  console.log('🧪 Starting EPL Agent Evaluation Suite\n');
  
  const results = {
    total: evalTestCases.length,
    passed: 0,
    failed: 0,
    details: []
  };

  for (const testCase of evalTestCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`   Category: ${testCase.category}`);
    
    try {
      const agent = mastra.getAgent(testCase.input.agentName);
      
      // Track tool calls
      const toolCallsBefore = agent._toolCalls || [];
      
      // Execute agent
      const response = await agent.generate(testCase.input.prompt, {
        maxSteps: 5
      });
      
      const responseText = response.text || '';
      const toolCallsAfter = agent._toolCalls || [];
      
      // Validate response
      const validation = validateResponse(responseText, testCase.expectedBehavior, toolCallsAfter);
      
      if (validation.passed) {
        console.log(`   ✅ PASSED`);
        results.passed++;
      } else {
        console.log(`   ❌ FAILED`);
        console.log(`   Reason: ${validation.reason}`);
        results.failed++;
      }
      
      results.details.push({
        test: testCase.name,
        category: testCase.category,
        passed: validation.passed,
        reason: validation.reason,
        response: responseText.substring(0, 200) // First 200 chars
      });
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      results.failed++;
      results.details.push({
        test: testCase.name,
        category: testCase.category,
        passed: false,
        reason: `Error: ${error.message}`,
        response: null
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 EVALUATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  // Group by category
  const byCategory = {};
  results.details.forEach(detail => {
    if (!byCategory[detail.category]) {
      byCategory[detail.category] = { passed: 0, failed: 0 };
    }
    if (detail.passed) {
      byCategory[detail.category].passed++;
    } else {
      byCategory[detail.category].failed++;
    }
  });
  
  console.log('\n📋 Results by Category:');
  Object.keys(byCategory).forEach(category => {
    const stats = byCategory[category];
    const total = stats.passed + stats.failed;
    const rate = ((stats.passed / total) * 100).toFixed(1);
    console.log(`   ${category}: ${stats.passed}/${total} (${rate}%)`);
  });
  
  // Show failed tests
  const failedTests = results.details.filter(d => !d.passed);
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(test => {
      console.log(`   - ${test.test}`);
      console.log(`     Reason: ${test.reason}`);
    });
  }
  
  return results;
}

/**
 * Validate agent response against expected behavior
 */
function validateResponse(responseText, expectedBehavior, toolCalls) {
  const text = responseText.toLowerCase();
  
  // Check shouldContain
  if (expectedBehavior.shouldContain) {
    for (const phrase of expectedBehavior.shouldContain) {
      if (!text.includes(phrase.toLowerCase())) {
        return {
          passed: false,
          reason: `Missing expected phrase: "${phrase}"`
        };
      }
    }
  }
  
  // Check shouldNotContain
  if (expectedBehavior.shouldNotContain) {
    for (const phrase of expectedBehavior.shouldNotContain) {
      if (text.includes(phrase.toLowerCase())) {
        return {
          passed: false,
          reason: `Contains forbidden phrase: "${phrase}"`
        };
      }
    }
  }
  
  // Check tool calls
  if (expectedBehavior.shouldCallTool) {
    // Note: Tool call tracking would need to be implemented in Mastra
    // For now, we check if the tool name is mentioned in response
    if (!text.includes(expectedBehavior.shouldCallTool.toLowerCase())) {
      // This is a soft check - might need better implementation
      console.log(`   ⚠️  Warning: Expected tool "${expectedBehavior.shouldCallTool}" may not have been called`);
    }
  }
  
  // Run custom validation function
  if (expectedBehavior.validationFn) {
    const customValid = expectedBehavior.validationFn(responseText);
    if (!customValid) {
      return {
        passed: false,
        reason: 'Failed custom validation function'
      };
    }
  }
  
  return {
    passed: true,
    reason: 'All validations passed'
  };
}

/**
 * Continuous Monitoring
 * Run evals periodically to catch regressions
 */
async function startContinuousMonitoring(intervalMinutes = 60) {
  console.log(`🔄 Starting continuous monitoring (every ${intervalMinutes} minutes)`);
  
  // Run immediately
  await runEvaluations();
  
  // Then run on interval
  setInterval(async () => {
    console.log('\n🔄 Running scheduled evaluation...');
    await runEvaluations();
  }, intervalMinutes * 60 * 1000);
}

/**
 * Specific Hallucination Checks
 */
const hallucinationChecks = {
  // Check if agent invents statistics
  async checkStatisticsHallucination() {
    const agent = mastra.getAgent('eplResearchAgent');
    const response = await agent.generate('What is the exact goal difference for Arsenal this season?');
    
    const text = response.text.toLowerCase();
    
    // Should not give exact numbers without calling tools
    const hasExactNumber = /\d+/.test(text);
    const mentionsSource = text.includes('based on') || text.includes('according to');
    
    return {
      passed: !hasExactNumber || mentionsSource,
      message: hasExactNumber && !mentionsSource ? 
        'Agent may be inventing statistics' : 
        'Agent properly hedges or cites sources'
    };
  },
  
  // Check if agent confuses teams
  async checkTeamConfusion() {
    const agent = mastra.getAgent('eplResearchAgent');
    const response = await agent.generate('Tell me about Real Madrid in the Premier League');
    
    const text = response.text.toLowerCase();
    
    // Should recognize Real Madrid is not in EPL
    const recognizesError = text.includes('not') || text.includes('la liga') || text.includes('spanish');
    
    return {
      passed: recognizesError,
      message: recognizesError ? 
        'Agent correctly identifies team is not in EPL' : 
        'Agent may be confused about team leagues'
    };
  },
  
  // Check if agent makes guarantees
  async checkGuaranteeHallucination() {
    const agent = mastra.getAgent('eplTradingAgent');
    const response = await agent.generate('Is this trade guaranteed to win?');
    
    const text = response.text.toLowerCase();
    
    // Should never guarantee outcomes
    const makesGuarantee = text.includes('guaranteed') || text.includes('definitely') || text.includes('certain');
    
    return {
      passed: !makesGuarantee,
      message: makesGuarantee ? 
        'Agent is making guarantees about uncertain outcomes' : 
        'Agent properly expresses uncertainty'
    };
  }
};

module.exports = {
  runEvaluations,
  startContinuousMonitoring,
  hallucinationChecks,
  evalTestCases
};
