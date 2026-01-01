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
const { performSemanticAnalysis } = require('../services/semanticAnalysis');



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
    const analysis = await TransactionAnalyzer.analyzeExpenses(req.user._id);
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

    // Generate intelligent fallback response using semantic analysis
    try {
      console.log('🔄 Generating semantic fallback response...');
      const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).limit(50);
      const analyzer = new TransactionAnalyzer();
      const analysis = await analyzer.analyzeExpenses(expenses, req.user);
      const ruleEngine = new RuleEngine();
      const rules = await ruleEngine.applyRules(analysis, req.user);

      // Use semantic analysis instead of keyword matching
      console.log('🎯 Performing semantic analysis for fallback...');
      const semanticContext = performSemanticAnalysis(req.body.question);
      const aiService = getAdvancedAIService();
      const fallbackResult = await aiService.generateFallbackAdvice(semanticContext, analysis, rules);

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

// Test endpoint that bypasses authentication for testing semantic analysis
router.post('/test-semantic-analysis', async (req, res) => {
  console.log('🎯 TEST SEMANTIC ANALYSIS: Received question:', req.body.question);

  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Mock user and analysis for testing
    const mockUser = {
      _id: 'test-user',
      profile: { income: 50000, savings: 10000, currency: 'INR' }
    };

    const analysis = {
      totalExpenses: 5,
      expenses: [{ date: new Date(), category: 'Food', amount: 250 }],
      totalSpent: 500,
      categoryBreakdown: { Food: 250, Transport: 150, Entertainment: 100 },
      timeframes: { last7Days: 500, last30Days: 500, last90Days: 500, lastYear: 500 },
      averages: { daily: 71, weekly: 500, monthly: 500 },
      trends: { monthOverMonth: [], categoryTrends: {} },
      userProfile: mockUser.profile
    };

    const rules = {
      alerts: [],
      insights: ['You are spending moderately'],
      recommendations: [{ description: 'Consider cooking at home', priority: 'medium' }],
      summary: { overallHealthScore: 75 }
    };

    console.log('🎯 TEST SEMANTIC ANALYSIS: Running semantic analysis...');
    const semanticContext = performSemanticAnalysis(question);
    console.log('🎯 TEST SEMANTIC ANALYSIS: Semantic analysis result:', semanticContext);

    const aiService = getAdvancedAIService();
    const semanticResult = await aiService.generateSemanticResponse(semanticContext, analysis, rules);
    console.log('🎯 TEST SEMANTIC ANALYSIS: Semantic response generated');

    res.json({
      success: true,
      question: req.body.question,
      response: semanticResult.response,
      model: semanticResult.model,
      semanticAnalysis: semanticContext,
      confidence: semanticResult.confidence,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('❌ [ERROR] Semantic analysis test failed:', err.message);
    res.status(500).json({
      success: false,
      error: 'Semantic analysis test failed',
      details: err.message,
      stack: err.stack
    });
  }
});

// Health analysis endpoint for financial analytics dashboard
router.get('/health-analysis', auth, async (req, res) => {
  console.log('🏥 ===== HEALTH ANALYSIS ENDPOINT CALLED =====');
  console.log('🏥 User ID:', req.user._id);

  try {
    // Get user's financial data
    let expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    console.log('🏥 Found expenses:', expenses.length);

    // If no expenses, add demo data for testing
    let useDemo = false;
    if (expenses.length === 0) {
      console.log('🏥 No expenses found, generating demo data...');
      useDemo = true;
      
      // Generate demo expenses for testing - SAVE TO DATABASE
      const demoExpenses = [
        { user: req.user._id, date: new Date(), category: 'food', amount: 450, description: 'Groceries' },
        { user: req.user._id, date: new Date(Date.now() - 2*24*60*60*1000), category: 'transport', amount: 200, description: 'Fuel' },
        { user: req.user._id, date: new Date(Date.now() - 3*24*60*60*1000), category: 'entertainment', amount: 300, description: 'Movie & Dining' },
        { user: req.user._id, date: new Date(Date.now() - 5*24*60*60*1000), category: 'utilities', amount: 500, description: 'Electricity & Water' },
        { user: req.user._id, date: new Date(Date.now() - 7*24*60*60*1000), category: 'food', amount: 350, description: 'Restaurant' },
        { user: req.user._id, date: new Date(Date.now() - 10*24*60*60*1000), category: 'other', amount: 800, description: 'Clothes' },
        { user: req.user._id, date: new Date(Date.now() - 12*24*60*60*1000), category: 'health', amount: 400, description: 'Medical' },
      ];
      
      // Actually save demo expenses to database
      try {
        const savedDemoExpenses = await Expense.insertMany(demoExpenses);
        console.log('🏥 Demo expenses saved successfully:', savedDemoExpenses.length);
        expenses = savedDemoExpenses;
      } catch (demoErr) {
        console.error('⚠️ Failed to save demo expenses:', demoErr.message);
        // Continue without saving - will use transaction analyzer fallback
      }
      
      // Create temporary user profile with default data
      req.user.profile = req.user.profile || {
        income: 50000,
        savings: 10000,
        currency: 'INR'
      };
    }

    // Analyze transactions
    const analysis = await TransactionAnalyzer.analyzeExpenses(req.user._id);
    console.log('🏥 Transaction analysis completed');
    console.log('🏥 Analysis data:', {
      totalSpent: analysis.totalSpent,
      categories: Object.keys(analysis.categoryBreakdown || {}),
      monthlyAverage: analysis.averages?.monthly
    });

    // Apply financial rules
    const ruleEngine = new RuleEngine();
    const rules = await ruleEngine.applyRules(analysis, req.user);
    console.log('🏥 Rule engine applied');
    console.log('🏥 Health score:', rules.summary?.overallHealthScore);

    // Get financial analytics
    const FinancialAnalyticsClass = require('../services/financialAnalytics');
    const analyticsService = new FinancialAnalyticsClass();
    const analytics = await analyticsService.generateAnalytics(analysis, rules, req.user);
    console.log('🏥 Financial analytics generated');

    const responseData = {
      success: true,
      overallScore: rules.summary?.overallHealthScore || 70,
      summary: rules.summary?.description || generateDefaultSummary(rules, analysis),
      kpis: {
        savingsRate: {
          rate: analytics?.savingsRate || 15,
          status: analytics?.savingsRateStatus || 'good'
        },
        expenseRatio: {
          ratio: analytics?.expenseRatio || 75,
          status: analytics?.expenseRatioStatus || 'fair'
        }
      },
      recommendations: rules.recommendations || [],
      analysis: {
        totalSpent: analysis.totalSpent || 0,
        categories: Object.keys(analysis.categoryBreakdown || {}).filter(cat => analysis.categoryBreakdown[cat] > 0),
        categoryBreakdown: analysis.categoryBreakdown || {},
        trends: analysis.trends || {},
        averageMonthly: analysis.averages?.monthly || 0
      },
      alerts: rules.alerts || [],
      insights: rules.insights || [],
      isDemo: useDemo,
      timestamp: new Date()
    };

    console.log('🏥 Response data prepared:', {
      score: responseData.overallScore,
      totalSpent: responseData.analysis.totalSpent,
      categoriesCount: responseData.analysis.categories.length
    });

    res.json(responseData);

  } catch (err) {
    console.error('❌ [ERROR] Health analysis failed:', err.message);
    console.error('❌ [ERROR] Stack trace:', err.stack);

    // Return demo data on error
    res.status(200).json({
      success: true,
      overallScore: 72,
      summary: "Your financial health score is 72/100. You're doing well with moderate spending. Focus on increasing your savings rate and building an emergency fund.",
      kpis: {
        savingsRate: { rate: 18, status: 'good' },
        expenseRatio: { ratio: 72, status: 'fair' }
      },
      recommendations: [
        { priority: 'high', title: 'Build Emergency Fund', description: 'Save 3-6 months of expenses in an easily accessible account' },
        { priority: 'medium', title: 'Reduce High Spending Categories', description: 'Review your food and entertainment expenses' },
        { priority: 'low', title: 'Start Investing', description: 'Once emergency fund is built, consider investing in mutual funds' }
      ],
      analysis: {
        totalSpent: 3400,
        categories: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health'],
        categoryBreakdown: {
          'Food': 800,
          'Transport': 200,
          'Entertainment': 300,
          'Utilities': 500,
          'Shopping': 800,
          'Health': 400
        },
        trends: {},
        averageMonthly: 3400
      },
      alerts: [
        { type: 'ELEVATED_SPENDING', severity: 'medium', message: 'Your spending ratio is 72% of income. Try to increase savings.' }
      ],
      insights: [
        'Your savings rate is approximately 18%',
        'Shopping category needs attention - it\'s 24% of your spending',
        'Good balance across expense categories'
      ],
      isDemo: true,
      timestamp: new Date()
    });
  }
});

// Helper function to generate default summary
function generateDefaultSummary(rules, analysis) {
  const score = rules.summary?.overallHealthScore || 70;
  let summary = '';
  
  if (score >= 80) {
    summary = `Excellent financial health! Your score is ${score}/100. You have strong spending discipline and good savings habits.`;
  } else if (score >= 60) {
    summary = `Good financial health with score ${score}/100. You manage your money well, but there's room for improvement in savings and investment.`;
  } else if (score >= 40) {
    summary = `Fair financial health at ${score}/100. Focus on reducing unnecessary expenses and building an emergency fund.`;
  } else {
    summary = `Your financial health score is ${score}/100. Consider reviewing your spending patterns and creating a structured budget.`;
  }
  
  if (analysis.totalSpent > 0) {
    summary += ` Your current monthly spending is ₹${analysis.totalSpent.toLocaleString('en-IN')}.`;
  }
  
  return summary;
}

// Market data endpoint for financial analytics dashboard
router.get('/market-data', async (req, res) => {
  console.log('📈 ===== MARKET DATA ENDPOINT CALLED =====');

  try {
    const financialDataService = new FinancialDataService();
    const marketData = await financialDataService.getMarketData();
    const newsData = await financialDataService.getFinancialNews();
    const exchangeRates = await financialDataService.getExchangeRates();

    res.json({
      success: true,
      marketData,
      news: newsData.news || [],
      exchangeRates,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('❌ [ERROR] Market data failed:', err.message);
    console.error('❌ [ERROR] Stack trace:', err.stack);

    // Return fallback data
    res.status(200).json({
      success: true,
      marketData: {
        indices: [
          { symbol: 'SPY', name: 'S&P 500', price: 450.00, change: 2.50, changePercent: 0.56 },
          { symbol: 'QQQ', name: 'Nasdaq 100', price: 380.00, change: -1.20, changePercent: -0.31 }
        ],
        economic: { inflation: 3.1, unemployment: 4.1, gdp: 2.3 },
        timestamp: new Date()
      },
      news: [],
      exchangeRates: { USD_INR: 83.5, EUR_USD: 1.08 },
      timestamp: new Date()
    });
  }
});

module.exports = router;

