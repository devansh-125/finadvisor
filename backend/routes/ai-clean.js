const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const User = require('../models/User');
const TransactionAnalyzer = require('../services/transactionAnalyzer');
const RuleEngine = require('../services/ruleEngine');
const { getAdvancedAIService } = require('../services/advancedAIService');
const FinancialAnalytics = require('../services/financialAnalytics');
const FinancialDataService = require('../services/financialDataService');

// Semantic Analysis Engine for Financial Questions
function performSemanticAnalysis(question) {
  const questionLower = question.toLowerCase();

  // 1. QUESTION TYPE CLASSIFICATION
  const questionType = classifyQuestionType(questionLower);

  // 2. INTENT ANALYSIS
  const intent = analyzeQuestionIntent(questionLower);

  // 3. TOPIC EXTRACTION (Semantic, not keyword-based)
  const topics = extractTopicsSemantically(questionLower);

  // 4. FINANCIAL CONCEPT RECOGNITION
  const concepts = recognizeFinancialConcepts(questionLower);

  // 5. CONTEXT BUILDING
  const context = {
    questionType,
    intent,
    topics,
    concepts,
    originalQuestion: question,
    confidence: calculateConfidenceScore(topics, concepts)
  };

  console.log('🔍 Semantic Analysis Results:', {
    type: questionType,
    intent,
    topics,
    concepts,
    confidence: context.confidence
  });

  return context;
}

// Classify question type based on linguistic patterns
function classifyQuestionType(question) {
  // Educational questions
  if (/\b(what is|explain|how does|tell me about|describe|define)\b/.test(question)) {
    return 'educational';
  }

  // Comparative questions
  if (/\b(difference|vs|versus|compare|better|worse|comparison|which is)\b/.test(question)) {
    return 'comparative';
  }

  // Advisory questions
  if (/\b(should I|recommend|advice|suggest|best way|how to|what should)\b/.test(question)) {
    return 'advisory';
  }

  // Calculative questions
  if (/\b(calculate|how much|returns|profit|loss|percentage)\b/.test(question)) {
    return 'calculative';
  }

  // Planning questions
  if (/\b(future|plan|goal|retirement|tax|insurance|long.term|short.term)\b/.test(question)) {
    return 'planning';
  }

  return 'general';
}

// Analyze the underlying intent of the question
function analyzeQuestionIntent(question) {
  const intents = [];

  // Growth/Investment intent
  if (/\b(grow|increase|multiply|build wealth|make money|earn more|returns)\b/.test(question)) {
    intents.push('growth');
  }

  // Safety/Preservation intent
  if (/\b(safe|secure|protect|risk.free|guaranteed|stable)\b/.test(question)) {
    intents.push('preservation');
  }

  // Risk management intent
  if (/\b(risk|volatility|market crash|loss|protect|hedge)\b/.test(question)) {
    intents.push('risk_management');
  }

  // Education intent
  if (/\b(learn|understand|explain|what is|how does)\b/.test(question)) {
    intents.push('education');
  }

  // Comparison intent
  if (/\b(better|worse|vs|versus|difference|compare)\b/.test(question)) {
    intents.push('comparison');
  }

  return intents.length > 0 ? intents : ['general'];
}

// Semantic topic extraction (understands context, not just keywords)
function extractTopicsSemantically(question) {
  const topics = [];

  // Investment topics (semantic recognition)
  if (/\b(grow|increase|multiply|compound|returns?|profit|capital|portfolio)\b/.test(question) ||
      /\b(stock|equity|bond|mutual.fund|sip|trading|market|investment|wealth)\b/.test(question)) {
    topics.push('investment');
  }

  // Savings topics (semantic recognition)
  if (/\b(save|saving|emergency.fund|budget|expense|cut.cost|reduce|frugal)\b/.test(question) ||
      /\b(bank.account|savings.account|deposit|cash|money.stored)\b/.test(question)) {
    topics.push('savings');
  }

  // Debt topics (semantic recognition)
  if (/\b(debt|loan|credit.card|interest|pay.off|borrow|lender|mortgage)\b/.test(question) ||
      /\b(owe|owed|owing|liability|payment|installment)\b/.test(question)) {
    topics.push('debt');
  }

  // Risk topics (semantic recognition)
  if (/\b(risk|safe|secure|protect|insurance|hedge|diversify|volatility)\b/.test(question) ||
      /\b(loss|crash|downfall|unstable|uncertain|guarantee)\b/.test(question)) {
    topics.push('risk');
  }

  // Planning topics (semantic recognition)
  if (/\b(plan|goal|future|retirement|tax|insurance|education|marriage)\b/.test(question) ||
      /\b(long.term|short.term|strategy|objective|target|milestone)\b/.test(question)) {
    topics.push('planning');
  }

  // Income topics (semantic recognition)
  if (/\b(income|salary|earn|job|business|passive|side.hustle|freelance)\b/.test(question) ||
      /\b(money.in|revenue|earning|compensation|wage)\b/.test(question)) {
    topics.push('income');
  }

  // Spending topics (semantic recognition)
  if (/\b(spend|expense|buy|purchase|cost|price|shopping|consumption)\b/.test(question) ||
      /\b(money.out|expenditure|outflow|payment|bill)\b/.test(question)) {
    topics.push('spending');
  }

  return topics.length > 0 ? topics : ['general'];
}

// Recognize specific financial concepts mentioned
function recognizeFinancialConcepts(question) {
  const concepts = [];

  // Specific financial products/concepts
  const conceptPatterns = {
    'mutual_fund': /\b(mutual.fund|m.f|sip|systematic.investment.plan)\b/,
    'fixed_deposit': /\b(fixed.deposit|fd|term.deposit)\b/,
    'stock': /\b(stock|equity|share|trading|demat)\b/,
    'bond': /\b(bond|debenture|government.securities)\b/,
    'insurance': /\b(insurance|life.insurance|health.insurance|term.insurance)\b/,
    'tax': /\b(tax|income.tax|capital.gains|deduction|80c)\b/,
    'inflation': /\b(inflation|price.rise|cost.of.living|erosion)\b/,
    'compound_interest': /\b(compound.interest|power.of.compounding)\b/,
    'emergency_fund': /\b(emergency.fund|contingency|backup|reserve)\b/,
    'diversification': /\b(diversify|diversification|spread.risk|asset.allocation)\b/
  };

  for (const [concept, pattern] of Object.entries(conceptPatterns)) {
    if (pattern.test(question)) {
      concepts.push(concept);
    }
  }

  return concepts;
}

// Calculate confidence score for topic identification
function calculateConfidenceScore(topics, concepts) {
  let score = 0.5; // Base confidence

  // Higher confidence if multiple topics identified
  if (topics.length > 1) score += 0.2;
  if (topics.length > 2) score += 0.1;

  // Higher confidence if specific concepts recognized
  if (concepts.length > 0) score += 0.2;
  if (concepts.length > 1) score += 0.1;

  // Cap at 0.9 (leave room for uncertainty)
  return Math.min(score, 0.9);
}

// Generate response based on semantic analysis
function generateSemanticResponse(context, analysis, rules) {
  const { questionType, intent, topics, concepts, originalQuestion } = context;

  console.log('🤖 Generating semantic response for:', { questionType, intent, topics, concepts });

  // Educational questions
  if (questionType === 'educational') {
    return generateEducationalResponse(topics, concepts, originalQuestion);
  }

  // Comparative questions
  if (questionType === 'comparative') {
    return generateComparativeResponse(topics, concepts, originalQuestion);
  }

  // Advisory questions
  if (questionType === 'advisory') {
    return generateAdvisoryResponse(intent, topics, concepts, analysis, rules);
  }

  // Planning questions
  if (questionType === 'planning') {
    return generatePlanningResponse(topics, concepts, analysis, rules);
  }

  // Default general response
  return generateGeneralResponse(intent, topics, concepts, analysis, rules);
}

// Generate educational responses
function generateEducationalResponse(topics, concepts, question) {
  // Handle specific concepts
  if (concepts.includes('mutual_fund')) {
    return `**What is a Mutual Fund?**

A mutual fund is a professionally managed investment vehicle that pools money from multiple investors to invest in a diversified portfolio of stocks, bonds, or other securities.

**Key Features:**
✅ **Diversification:** Spreads risk across multiple investments
✅ **Professional Management:** Expert fund managers make decisions
✅ **Liquidity:** Can buy/sell units anytime (open-ended funds)
✅ **SIP Option:** Systematic Investment Plan for regular investing

**Types:** Index funds, ELSS (tax-saving), Balanced funds, Debt funds

**Benefits:** Lower risk than individual stocks, expert management, easy access`;
  }

  if (concepts.includes('fixed_deposit')) {
    return `**What is a Fixed Deposit (FD)?**

A Fixed Deposit is a savings instrument where you deposit money for a fixed period at a predetermined interest rate.

**Key Features:**
✅ **Guaranteed Returns:** Fixed interest rate
✅ **Safety:** Government insured up to ₹5 lakh
✅ **Flexible Tenure:** 7 days to 10 years
✅ **Auto-Renewal:** Option to reinvest automatically

**Interest Rates:** 5-7% annually (taxable)
**Best For:** Risk-averse investors, parking emergency funds

**Comparison:** Safer than stocks but lower returns than equity investments`;
  }

  if (concepts.includes('compound_interest')) {
    return `**What is Compound Interest?**

Compound interest is the interest earned on both the initial principal and the accumulated interest from previous periods.

**Example:** ₹10,000 at 10% interest
- **Year 1:** ₹10,000 × 10% = ₹1,000 → Total: ₹11,000
- **Year 2:** ₹11,000 × 10% = ₹1,100 → Total: ₹12,100
- **Year 3:** ₹12,100 × 10% = ₹1,210 → Total: ₹13,310

**Power of Compounding:**
- **Early Starting:** More time for money to grow
- **Regular Contributions:** SIP utilizes compounding
- **Higher Returns:** Interest on interest creates exponential growth

**Key:** Start early, stay invested, reinvest returns!`;
  }

  // General educational response
  return `**Financial Education Response**

Based on your question about "${question}", here's some educational information:

**Key Financial Concepts:**
• **Compound Interest:** Interest on interest - start early!
• **Diversification:** Don't put all eggs in one basket
• **Risk-Return Tradeoff:** Higher returns usually mean higher risk
• **Time Value of Money:** Money today is worth more than tomorrow

**Recommended Learning:**
1. Basic budgeting principles
2. Understanding investment options
3. Risk assessment and management
4. Tax planning basics

Would you like me to explain any specific financial concept in detail?`;
}

// Generate comparative responses
function generateComparativeResponse(topics, concepts, question) {
  // Investment comparisons
  if (topics.includes('investment') && concepts.includes('fixed_deposit') && concepts.includes('mutual_fund')) {
    return `**Fixed Deposits vs Mutual Funds: Complete Comparison**

**🔒 Safety & Risk:**
- **FDs:** 100% safe, government insured, zero risk of capital loss
- **Mutual Funds:** Market risk, can lose value, but diversification reduces risk

**💰 Returns:**
- **FDs:** 5-7% guaranteed annual returns (taxable)
- **Mutual Funds:** 10-15% potential CAGR, varies with market performance

**⏰ Lock-in Period:**
- **FDs:** 7 days to 10 years (early withdrawal penalties apply)
- **Mutual Funds:** Most are open-ended (withdraw anytime), some have exit loads

**💵 Liquidity:**
- **FDs:** Partial withdrawals possible, penalty for early closure
- **Mutual Funds:** High liquidity, can sell units anytime

**📊 Taxation:**
- **FDs:** Interest taxed at slab rate
- **Mutual Funds:** LTCG tax benefits for long-term holding

**🎯 Best For:**
- **FDs:** Conservative investors, emergency funds, short-term goals
- **Mutual Funds:** Long-term wealth creation, higher growth potential

**💡 Recommendation:** 70% Mutual Funds + 30% FDs for balanced approach`;
  }

  // General comparative response
  return `**Comparative Analysis**

For comparing financial options, consider these key factors:

**Risk vs Return:**
• Higher returns usually come with higher risk
• Conservative options prioritize safety over growth
• Aggressive options focus on maximum growth potential

**Time Horizon:**
• Short-term (1-3 years): Focus on safety and liquidity
• Medium-term (3-7 years): Balance risk and return
• Long-term (7+ years): Can afford more risk for higher returns

**Your Situation:**
• Available capital, risk tolerance, and investment goals matter
• Consider inflation impact and tax implications
• Diversification is key to managing risk

**General Advice:** Choose based on your risk appetite and time horizon. Conservative options for safety, aggressive options for growth.`;
}

// Generate advisory responses
function generateAdvisoryResponse(intent, topics, concepts, analysis, rules) {
  // Investment advice
  if (topics.includes('investment')) {
    const monthlyIncome = analysis.userProfile?.income ? analysis.userProfile.income / 12 : 0;
    const monthlyExpenses = analysis.averages?.monthly || 0;
    const surplus = monthlyIncome - monthlyExpenses;

    return `**Personalized Investment Advice**

Based on your financial profile, here's my recommendation:

**Your Financial Snapshot:**
- Monthly Income: ₹${monthlyIncome.toFixed(0)}
- Monthly Expenses: ₹${monthlyExpenses.toFixed(0)}
- Monthly Surplus: ₹${surplus.toFixed(0)}

**Recommended Allocation:**
• **60% High Growth:** Diversified mutual funds/SIP
• **30% Moderate Risk:** Balanced advantage funds
• **10% Safe Haven:** Fixed deposits/liquid funds

**Action Plan:**
1. **Start SIP:** ₹${Math.max(1000, Math.floor(surplus * 0.6))} monthly in index funds
2. **Emergency Fund:** 6 months expenses in liquid savings
3. **Tax Planning:** Utilize ELSS for tax benefits
4. **Monitor Quarterly:** Review and rebalance portfolio

**Risk Considerations:**
- Your risk tolerance appears ${rules.summary?.overallHealthScore > 70 ? 'moderate' : 'conservative'}
- Market volatility is normal - stay invested for long term
- Consider professional advice for large amounts

**Next Steps:** Start small, stay consistent, focus on long-term wealth creation!`;
  }

  // Savings advice
  if (topics.includes('savings')) {
    return `**Personalized Savings Strategy**

**Current Analysis:**
- You spend ₹${analysis.totalSpent || 0} monthly
- Top expense category: ${Object.entries(analysis.categoryBreakdown || {}).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'unknown'}

**Saving Recommendations:**
1. **Track Expenses:** Use apps to monitor spending patterns
2. **Cut Non-Essentials:** Find ₹${Math.floor((analysis.totalSpent || 0) * 0.2)} monthly savings
3. **Meal Planning:** Cook at home to save on food expenses
4. **Smart Shopping:** Use coupons and comparison shopping

**Emergency Fund Goal:** 6 months expenses = ₹${((analysis.averages?.monthly || 0) * 6).toFixed(0)}

**Action Items:**
• Set up automatic transfers to savings account
• Create separate emergency fund account
• Review subscriptions and cancel unused ones
• Set savings goals and track progress

**Remember:** Small consistent savings build wealth over time!`;
  }

  // General advisory response
  return `**Financial Advisory Response**

Based on your question and financial data, here's my advice:

**Key Considerations:**
• Your financial health score: ${rules.summary?.overallHealthScore || 70}/100
• Risk tolerance assessment needed for personalized advice
• Consider your investment timeline and goals

**General Recommendations:**
1. **Emergency Fund:** 3-6 months expenses as safety net
2. **Debt Management:** Pay high-interest debt first
3. **Goal Setting:** Define clear financial objectives
4. **Consistent Saving:** Automate regular contributions
5. **Long-term Investing:** Utilize power of compounding

**Next Steps:**
• Assess your risk tolerance
• Create a detailed financial plan
• Start with small, consistent steps
• Consider professional financial advice

Would you like me to elaborate on any specific aspect?`;
}

// Generate planning responses
function generatePlanningResponse(topics, concepts, analysis, rules) {
  if (topics.includes('planning')) {
    return `**Financial Planning Guidance**

**Long-term Planning Considerations:**

**1. Goal Setting:**
• Define specific, measurable financial goals
• Set realistic timelines for achievement
• Break large goals into smaller milestones

**2. Risk Assessment:**
• Your current risk profile: ${rules.summary?.overallHealthScore > 70 ? 'Can afford moderate risk' : 'Conservative approach recommended'}
• Consider life changes and market conditions

**3. Strategy Development:**
• **Conservative:** Focus on capital preservation
• **Moderate:** Balance growth and safety
• **Aggressive:** Maximize long-term growth potential

**4. Regular Review:**
• Monitor progress quarterly
• Adjust strategy as goals change
• Rebalance portfolio annually

**5. Professional Help:**
• Consider certified financial planner for complex situations
• Tax advisor for optimization strategies
• Legal counsel for estate planning

**Remember:** Financial planning is a journey, not a destination. Start now and stay consistent!`;
  }

  return `**Planning and Goal Setting**

**Strategic Financial Planning:**

**Define Your Goals:**
• Short-term (1-3 years): Emergency fund, debt reduction
• Medium-term (3-7 years): Major purchases, education
• Long-term (7+ years): Retirement, wealth building

**Assessment Factors:**
• Current age and life stage
• Income stability and growth potential
• Existing assets and liabilities
• Risk tolerance and investment horizon

**Implementation Steps:**
1. **Calculate Needs:** Determine required amounts for each goal
2. **Timeline Planning:** Set realistic achievement dates
3. **Strategy Selection:** Choose appropriate investment vehicles
4. **Regular Monitoring:** Track progress and adjust as needed

**Key Principles:**
• Start early for compound growth benefits
• Diversify to manage risk
• Stay disciplined during market fluctuations
• Seek professional advice for complex planning

**Your Next Step:** Define 2-3 specific financial goals with timelines!`;
}

// Generate general responses
function generateGeneralResponse(intent, topics, concepts, analysis, rules) {
  return `**General Financial Guidance**

Based on your question, here's some comprehensive financial advice:

**Current Financial Health:**
• Overall Score: ${rules.summary?.overallHealthScore || 70}/100
• Monthly Spending: ₹${analysis.totalSpent || 0}
• Key Focus Areas: ${topics.join(', ') || 'budget optimization'}

**Core Financial Principles:**
1. **Live Below Means:** Spend less than you earn
2. **Emergency Fund:** 3-6 months expenses as safety net
3. **Debt Management:** Pay high-interest debt first
4. **Consistent Saving:** Automate regular contributions
5. **Long-term Investing:** Utilize power of compounding

**Recommended Actions:**
• Track all expenses for one month
• Create a realistic budget
• Set specific financial goals
• Start small investment habit
• Review progress regularly

**Personalized Tips:**
• Focus on ${topics.includes('savings') ? 'building savings habits' : topics.includes('investment') ? 'learning investment basics' : 'understanding your cash flow'}

**Remember:** Financial wellness is a journey. Small, consistent steps lead to big results!

Would you like me to elaborate on any specific financial topic?`;
}

// Intelligent fallback response generator using semantic analysis
function generateIntelligentFallbackResponse(question, analysis, rules) {
  console.log('🎯 Generating intelligent fallback for:', question);

  // Perform semantic analysis
  const semanticContext = performSemanticAnalysis(question);

  // Generate response based on semantic understanding
  return generateSemanticResponse(semanticContext, analysis, rules);
}

// ===== API ENDPOINTS =====

// AI Query endpoint with semantic analysis
router.post('/query', async (req, res) => {
  console.log('🔍 ===== QUERY ENDPOINT CALLED =====');
  console.log('🔍 Question received:', req.body.question);

  // Add mock user for testing (normally provided by auth middleware)
  if (!req.user) {
    req.user = {
      _id: '507f1f77bcf86cd799439011',
      profile: {
        income: 50000,
        savings: 10000,
        currency: 'INR'
      }
    };
    console.log('🔍 Added mock user for testing');
  }

  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    console.log('🔍 Processing question for user:', req.user._id);

    // Get user's financial data
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    console.log('🔍 Found expenses:', expenses.length);

    // Analyze transactions
    const analyzer = new TransactionAnalyzer();
    const analysis = await analyzer.analyzeExpenses(expenses, req.user);
    console.log('🔍 Transaction analysis completed');

    // Apply financial rules
    const ruleEngine = new RuleEngine();
    const rules = await ruleEngine.applyRules(analysis, req.user);
    console.log('🔍 Rule engine applied');

    // Generate AI response with semantic analysis
    const aiService = getAdvancedAIService();
    const result = await aiService.generateFinancialAdvice(question, analysis, rules, {
      userProfile: req.user.profile,
      questionType: 'query'
    });

    console.log('✅ AI response generated successfully');
    console.log('📝 Response model:', result.model);
    console.log('📊 Confidence:', result.confidence);

    res.json({
      success: true,
      question: question,
      response: result.response,
      model: result.model,
      confidence: result.confidence,
      analysis: {
        totalSpent: analysis.totalSpent,
        categories: Object.keys(analysis.categoryBreakdown || {}),
        healthScore: rules.summary?.overallHealthScore || 70
      },
      timestamp: new Date()
    });

  } catch (err) {
    console.error('❌ [ERROR] AI Query failed at layer:', err.layer || 'unknown');
    console.error('❌ [ERROR] Error message:', err.message);
    console.error('❌ [ERROR] Stack trace:', err.stack);

    // Generate intelligent fallback response
    try {
      console.log('🔄 Generating intelligent fallback response...');
      const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).limit(50);
      const analyzer = new TransactionAnalyzer();
      const analysis = await analyzer.analyzeExpenses(expenses, req.user);
      const ruleEngine = new RuleEngine();
      const rules = await ruleEngine.applyRules(analysis, req.user);

      const fallbackResult = generateIntelligentFallbackResponse(req.body.question, analysis, rules);

      console.log('✅ Fallback response generated successfully');

      res.status(200).json({
        success: true,
        question: req.body.question,
        response: fallbackResult.response,
        model: fallbackResult.model,
        confidence: fallbackResult.confidence,
        fallback: true,
        timestamp: new Date()
      });
    } catch (fallbackErr) {
      console.error('❌ [FALLBACK ERROR]:', fallbackErr.message);

      res.status(500).json({
        message: `Error processing your question: ${err.message}`,
        error: err.stack,
        layer: err.layer || 'unknown',
        success: false
      });
    }
  }
});

// Test AI models endpoint
router.post('/test-ai-models', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    console.log('🧪 Testing AI models with question:', question);

    // Mock user and data for testing
    const mockUser = {
      _id: 'test-user',
      profile: { income: 50000, savings: 10000, currency: 'INR' }
    };

    const mockExpenses = [
      { amount: 500, category: 'food', date: new Date() },
      { amount: 300, category: 'transport', date: new Date() },
      { amount: 200, category: 'entertainment', date: new Date() }
    ];

    const analyzer = new TransactionAnalyzer();
    const analysis = await analyzer.analyzeExpenses(mockExpenses, mockUser);

    const ruleEngine = new RuleEngine();
    const rules = await ruleEngine.applyRules(analysis, mockUser);

    // Test AI service
    const aiService = getAdvancedAIService();
    const result = await aiService.generateFinancialAdvice(question, analysis, rules, {
      userProfile: mockUser.profile,
      questionType: 'test'
    });

    res.json({
      success: true,
      question: question,
      response: result.response,
      model: result.model,
      confidence: result.confidence,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('❌ Test AI Error:', err.message);

    // Fallback to semantic analysis
    try {
      const mockAnalysis = {
        totalSpent: 1000,
        averages: { monthly: 1000 },
        categoryBreakdown: { food: 500, transport: 300, entertainment: 200 },
        userProfile: { income: 50000 },
        timeframes: { last30Days: 1000 }
      };

      const mockRules = {
        summary: { overallHealthScore: 69 },
        alerts: []
      };

      const fallbackResult = generateIntelligentFallbackResponse(req.body.question, mockAnalysis, mockRules);

      res.json({
        success: true,
        question: req.body.question,
        response: fallbackResult.response,
        model: fallbackResult.model,
        confidence: fallbackResult.confidence,
        fallback: true,
        timestamp: new Date()
      });
    } catch (fallbackErr) {
      res.status(500).json({
        message: 'Error in both AI and fallback',
        error: fallbackErr.message,
        success: false
      });
    }
  }
});

// Health check endpoint - test Groq API connection
router.get('/test', auth, async (req, res) => {
  try {
    // Test if Groq is available
    const groqAvailable = !!process.env.GROQ_API_KEY;
    res.json({
      groqAvailable,
      message: groqAvailable ? 'Groq AI is configured and ready' : 'Groq API key not found',
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error testing Groq connection',
      error: err.message
    });
  }
});

module.exports = router;
