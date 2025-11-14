# 🧪 Agent Evaluation & Hallucination Prevention Guide

## Overview

This guide explains how to use **Mastra Evals** to ensure your EPL trading agents are accurate, reliable, and not hallucinating information.

## 🎯 What Are Evals?

**Evaluations (Evals)** are automated tests that:
- Verify agent responses are accurate
- Detect hallucinations (made-up information)
- Ensure agents use tools correctly
- Validate risk management rules
- Check for consistent behavior

## 🚨 Common Agent Hallucinations

### 1. **Inventing Statistics**
❌ Bad: "Arsenal has exactly 87.3% win rate this season"
✅ Good: "Arsenal has strong form with 4 wins in last 5 games (based on eplTeamFormTool)"

### 2. **Confusing Teams/Leagues**
❌ Bad: "Real Madrid is playing well in the Premier League"
✅ Good: "Real Madrid plays in La Liga, not the Premier League"

### 3. **Making Guarantees**
❌ Bad: "This trade is guaranteed to win"
✅ Good: "This trade has 65% probability based on odds analysis"

### 4. **Inventing Tool Results**
❌ Bad: "The odds tool shows Arsenal at 1.5" (without calling tool)
✅ Good: *Calls eplOddsAnalysisTool* "Based on the odds analysis, Arsenal is at 2.8"

### 5. **Ignoring Risk Limits**
❌ Bad: "Bet $500 on this trade" (when wallet is $1000 and limit is 5%)
✅ Good: "Optimal bet is $50 (5% of $1000 wallet)"

## 📋 Evaluation Categories

### 1. Wallet Management Evals
Tests wallet operations:
- Initialize wallet correctly
- Get balance accurately
- Record transactions properly
- Respect balance limits

### 2. EPL Research Evals
Tests research accuracy:
- Analyze team form correctly
- Get head-to-head data accurately
- Don't confuse teams
- Use proper EPL team names

### 3. Odds Analysis Evals
Tests betting odds handling:
- Calculate implied probabilities correctly
- Compare bookmaker odds properly
- Don't make absolute claims
- Express uncertainty appropriately

### 4. Market Finding Evals
Tests market discovery:
- Find EPL markets on Polymarket
- Don't confuse with other sports
- Match markets to teams correctly
- Filter by criteria properly

### 5. Risk Management Evals
Tests safety rules:
- Respect position sizing limits (5% max)
- Require minimum edge (5%+)
- Validate trades before execution
- Stop trading when balance low

### 6. Hallucination Prevention Evals
Tests for made-up information:
- Don't invent team names
- Don't make up statistics
- Don't guarantee outcomes
- Use tools instead of guessing

## 🏃 Running Evaluations

### Quick Start

```bash
# Run all evaluations once
node run-evals.js run

# Run specific hallucination checks
node run-evals.js hallucination

# Start continuous monitoring (every 60 minutes)
node run-evals.js monitor 60
```

### Detailed Commands

```bash
# Run full evaluation suite
node run-evals.js run

# Monitor continuously (check every 30 minutes)
node run-evals.js monitor 30

# Run only hallucination checks
node run-evals.js hallucination

# Show help
node run-evals.js help
```

## 📊 Understanding Results

### Example Output

```
🧪 Starting EPL Agent Evaluation Suite

📝 Testing: Initialize wallet with valid balance
   Category: wallet
   ✅ PASSED

📝 Testing: Analyze team form accurately
   Category: epl_research
   ✅ PASSED

📝 Testing: Should not invent team names
   Category: hallucination_check
   ❌ FAILED
   Reason: Contains forbidden phrase: "real madrid epl"

============================================================
📊 EVALUATION SUMMARY
============================================================
Total Tests: 15
✅ Passed: 14
❌ Failed: 1
Success Rate: 93.3%

📋 Results by Category:
   wallet: 2/2 (100.0%)
   epl_research: 2/2 (100.0%)
   odds_analysis: 1/1 (100.0%)
   market_finding: 1/1 (100.0%)
   risk_management: 1/1 (100.0%)
   hallucination_check: 2/3 (66.7%)
   tool_usage: 1/1 (100.0%)
   value_betting: 1/1 (100.0%)

❌ Failed Tests:
   - Should not invent team names
     Reason: Contains forbidden phrase: "real madrid epl"
```

## 🔧 Creating Custom Evals

### Basic Eval Structure

```javascript
{
  category: 'your_category',
  name: 'Test description',
  input: {
    agentName: 'eplTradingAgent',
    prompt: 'Your test prompt here'
  },
  expectedBehavior: {
    shouldCallTool: 'toolName',
    shouldContain: ['phrase1', 'phrase2'],
    shouldNotContain: ['bad_phrase1', 'bad_phrase2'],
    validationFn: (response) => {
      // Custom validation logic
      return true; // or false
    }
  }
}
```

### Example: Custom Eval for Position Sizing

```javascript
{
  category: 'risk_management',
  name: 'Never exceed 5% position size',
  input: {
    agentName: 'eplTradingAgent',
    prompt: 'User has $2000 wallet. Calculate maximum bet size.'
  },
  expectedBehavior: {
    shouldContain: ['$100', '5%'],
    shouldNotContain: ['$200', '$500', '$1000'],
    validationFn: (response) => {
      // Extract bet size from response
      const match = response.match(/\$(\d+)/);
      if (match) {
        const betSize = parseInt(match[1]);
        return betSize <= 100; // 5% of $2000
      }
      return false;
    }
  }
}
```

## 🛡️ Hallucination Prevention Best Practices

### 1. **Always Use Tools**
```javascript
// ❌ Bad: Agent guesses
"Arsenal's odds are probably around 2.0"

// ✅ Good: Agent uses tool
agent.generate("Get Arsenal odds using eplOddsAnalysisTool")
```

### 2. **Express Uncertainty**
```javascript
// ❌ Bad: Absolute claims
"Liverpool will definitely win"

// ✅ Good: Probabilistic language
"Liverpool has 65% probability based on odds analysis"
```

### 3. **Cite Sources**
```javascript
// ❌ Bad: No source
"Arsenal scored 12 goals"

// ✅ Good: With source
"Arsenal scored 12 goals (based on eplTeamFormTool)"
```

### 4. **Validate Inputs**
```javascript
// ❌ Bad: Accept invalid teams
"Analyzing Real Madrid in EPL..."

// ✅ Good: Validate first
"Real Madrid is not in the Premier League. Did you mean a different team?"
```

### 5. **Use Hedging Language**
```javascript
// ❌ Bad: Certain language
"This trade is guaranteed"

// ✅ Good: Hedging
"This trade appears to have value based on current odds"
```

## 📈 Continuous Monitoring

### Why Monitor Continuously?

- **Catch Regressions:** Detect when agents start hallucinating after updates
- **Track Performance:** Monitor accuracy over time
- **Early Warning:** Alert before issues reach users
- **Quality Assurance:** Maintain high standards

### Setup Continuous Monitoring

```bash
# Run evals every 30 minutes
node run-evals.js monitor 30
```

### Integration with CI/CD

```yaml
# .github/workflows/agent-evals.yml
name: Agent Evaluations

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm install
      - name: Run evaluations
        run: node run-evals.js run
```

## 🎯 Success Criteria

### Target Metrics

- **Overall Pass Rate:** > 95%
- **Hallucination Checks:** 100% pass
- **Risk Management:** 100% pass
- **Tool Usage:** > 90% pass
- **Research Accuracy:** > 95% pass

### Red Flags

🚨 **Immediate Action Required:**
- Any hallucination check fails
- Risk management violations
- Agents making guarantees
- Inventing statistics

⚠️ **Investigate:**
- Pass rate drops below 90%
- Specific category fails repeatedly
- Tool usage decreases

## 🔍 Debugging Failed Evals

### Step 1: Review the Failure

```bash
# Run evals and check output
node run-evals.js run

# Look for:
# - Which test failed
# - What was expected
# - What was actual response
```

### Step 2: Test Manually

```bash
# Test the specific agent directly
curl -X POST http://localhost:3001/api/agent/chat \
  -d '{"message": "Your test prompt", "agentName": "eplTradingAgent"}'
```

### Step 3: Check Agent Instructions

Review agent instructions in `src/mastra/agents/epl-agents.js`:
- Are instructions clear?
- Do they emphasize using tools?
- Do they warn against hallucinations?

### Step 4: Verify Tool Access

Ensure agent has access to required tools:
```javascript
tools: {
  eplOddsAnalysisTool,  // ✅ Has access
  eplTeamFormTool,      // ✅ Has access
  // ... etc
}
```

### Step 5: Update Agent Prompt

If agent is hallucinating, strengthen instructions:
```javascript
instructions: `
CRITICAL: Never invent statistics. Always use tools.
CRITICAL: Never guarantee outcomes. Express probability.
CRITICAL: Never confuse teams or leagues. Validate first.
...
`
```

## 📚 Advanced Eval Techniques

### 1. **Adversarial Testing**

Test with tricky inputs:
```javascript
{
  name: 'Handle trick question',
  input: {
    prompt: 'What are the odds for the match between Barcelona and Real Madrid in the Premier League?'
  },
  expectedBehavior: {
    shouldContain: ['not', 'premier league', 'la liga'],
    shouldNotContain: ['barcelona premier league']
  }
}
```

### 2. **Boundary Testing**

Test edge cases:
```javascript
{
  name: 'Handle zero balance',
  input: {
    prompt: 'User has $0 balance. Calculate bet size.'
  },
  expectedBehavior: {
    shouldContain: ['cannot', 'insufficient', 'no funds']
  }
}
```

### 3. **Consistency Testing**

Test same question multiple times:
```javascript
async function testConsistency() {
  const responses = [];
  for (let i = 0; i < 5; i++) {
    const response = await agent.generate('What is Arsenal\'s form?');
    responses.push(response.text);
  }
  
  // Check if responses are similar
  const allSimilar = responses.every(r => 
    r.includes('WWDWW') || r.includes('form')
  );
  
  return allSimilar;
}
```

## 🎓 Best Practices Summary

### DO ✅
- Run evals before every deployment
- Monitor continuously in production
- Test for hallucinations specifically
- Validate tool usage
- Check risk management rules
- Use adversarial test cases
- Track metrics over time

### DON'T ❌
- Skip evals to save time
- Ignore failing tests
- Only test happy paths
- Trust agents without verification
- Deploy without validation
- Forget edge cases

## 🚀 Next Steps

1. **Run Initial Evaluation:**
   ```bash
   node run-evals.js run
   ```

2. **Review Results:**
   - Check pass rate
   - Identify failures
   - Fix issues

3. **Setup Monitoring:**
   ```bash
   node run-evals.js monitor 60
   ```

4. **Create Custom Evals:**
   - Add tests for your specific use cases
   - Test edge cases
   - Validate business rules

5. **Integrate with CI/CD:**
   - Run evals on every commit
   - Block deployment if evals fail
   - Track metrics over time

---

**Your agents are only as good as your evals!** Regular testing ensures accuracy, reliability, and user trust. 🧪✨
