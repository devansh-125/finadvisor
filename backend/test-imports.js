const TA = require('./services/transactionAnalyzer');
const RE = require('./services/ruleEngine');

console.log('=== Testing Imports ===');
console.log('TransactionAnalyzer:', typeof TA);
console.log('  - analyzeExpenses:', typeof TA.analyzeExpenses);
console.log('  - methods:', Object.getOwnPropertyNames(TA).filter(m => typeof TA[m] === 'function'));

console.log('\nRuleEngine:', typeof RE);
console.log('  - applyRules:', typeof RE.applyRules);
console.log('  - methods:', Object.getOwnPropertyNames(RE).filter(m => typeof RE[m] === 'function'));
