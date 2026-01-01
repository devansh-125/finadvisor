const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const User = require('../models/User');
const TransactionAnalyzer = require('../services/transactionAnalyzer');
const RuleEngine = require('../services/ruleEngine');
const { getOpenAIService } = require('../services/openaiService');
const FinancialAnalytics = require('../services/financialAnalytics');
const FinancialDataService = require('../services/financialDataService');



// AI Query endpoint using OpenAI API
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
    const rules = RuleEngine.applyRules(analysis);
    console.log('🔍 Rule engine applied');

    // Generate AI response using OpenAI
    const openaiService = getOpenAIService();
    const result = await openaiService.generateFinancialAdvice(question, analysis, rules, {
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
    console.error('❌ [ERROR] AI Query failed');
    console.error('❌ [ERROR] Layer:', err.layer || 'unknown');
    console.error('❌ [ERROR] Message:', err.message);
    console.error('❌ [ERROR] Stack:', err.stack);

    // Return exact error details - NO FALLBACK
    res.status(500).json({
      success: false,
      error: {
        message: err.message,
        type: err.name || 'Error',
        layer: err.layer || 'unknown',
        details: err.details || '',
        code: err.code || 'UNKNOWN_ERROR',
        timestamp: new Date(),
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      question: req.body.question
    });
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

// Test endpoint to see all user expenses
router.get('/debug-expenses', auth, async (req, res) => {
  try {
    const Expense = require('../models/Expense');
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    
    const breakdown = {};
    expenses.forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });
    
    res.json({
      totalExpenses: expenses.length,
      expenses: expenses.map(e => ({
        category: e.category,
        amount: e.amount,
        description: e.description,
        date: e.date
      })),
      categoryBreakdown: breakdown,
      sortedByAmount: Object.entries(breakdown)
        .filter(([, amt]) => amt > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amt]) => ({ category: cat, amount: amt }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint to debug category sorting
router.get('/test-sort', auth, async (req, res) => {
  try {
    const Expense = require('../models/Expense');
    const expenses = await Expense.find({ user: req.user._id });
    
    const breakdown = {};
    expenses.forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });
    
    console.log('🔍 TEST: Raw breakdown:', breakdown);
    
    const sorted = Object.entries(breakdown)
      .filter(([, amt]) => amt > 0)
      .sort((a, b) => {
        const result = b[1] - a[1];
        console.log(`🔍 TEST: Comparing ${a[0]}(${a[1]}) vs ${b[0]}(${b[1]}): result=${result}`);
        return result;
      });
    
    console.log('🔍 TEST: Sorted entries:', sorted);
    console.log('🔍 TEST: Sorted categories:', sorted.map(([cat]) => cat));
    
    res.json({
      raw: breakdown,
      sorted: sorted.map(([cat, amt]) => ({ category: cat, amount: amt })),
      categoriesArray: sorted.map(([cat]) => cat)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    // Ensure user has profile object
    if (!req.user.profile) {
      req.user.profile = {};
    }

    // If no expenses, add demo data for testing
    let useDemo = false;
    if (expenses.length === 0) {
      console.log('🏥 No expenses found, returning empty analysis');
      // No demo data generation - return empty state
    }

    // Analyze transactions
    const analysis = await TransactionAnalyzer.analyzeExpenses(req.user._id);
    console.log('🏥 Transaction analysis completed');
    console.log('🏥 Analysis categoryBreakdown:', analysis.categoryBreakdown);
    console.log('🏥 Analysis data:', {
      totalSpent: analysis.totalSpent,
      categories: Object.keys(analysis.categoryBreakdown || {}),
      monthlyAverage: analysis.averages?.monthly,
      userIncome: analysis.userProfile?.income,
      userSavings: analysis.userProfile?.savings
    });

    // Apply financial rules
    const rules = RuleEngine.applyRules(analysis);
    console.log('🏥 Rule engine applied');
    console.log('🏥 Health score:', rules.summary?.overallHealthScore);

    // Get financial analytics
    const FinancialAnalyticsClass = require('../services/financialAnalytics');
    const analyticsService = new FinancialAnalyticsClass();
    const analytics = await analyticsService.generateAnalytics(analysis, rules, req.user);
    console.log('🏥 Financial analytics generated');

    // Sort categories by spending amount (descending)
    console.log('🏥 Raw categoryBreakdown:', analysis.categoryBreakdown);
    console.log('🏥 Type of categoryBreakdown:', typeof analysis.categoryBreakdown);
    
    const categoryEntries = Object.entries(analysis.categoryBreakdown || {})
      .filter(([cat, amount]) => {
        const isPositive = amount > 0;
        console.log(`🏥 Filtering ${cat}: ${amount} > 0 = ${isPositive}`);
        return isPositive;
      })
      .sort((a, b) => {
        console.log(`🏥 Comparing ${a[0]}(${a[1]}) vs ${b[0]}(${b[1]}): ${b[1]} - ${a[1]} = ${b[1] - a[1]}`);
        return b[1] - a[1];
      });
    
    const sortedCategories = categoryEntries.map(([cat]) => cat);
    
    // Create a new categoryBreakdown in sorted order
    const sortedCategoryBreakdown = {};
    categoryEntries.forEach(([cat, amount]) => {
      sortedCategoryBreakdown[cat] = parseFloat(amount.toFixed(2));
    });
    
    console.log('🏥 Category entries after sort:', categoryEntries);
    console.log('🏥 Sorted categories array:', sortedCategories);
    console.log('🏥 Sorted categoryBreakdown:', sortedCategoryBreakdown);

    const responseData = {
      success: true,
      overallScore: rules.summary?.overallHealthScore || 0,
      summary: rules.summary?.description || generateDefaultSummary(rules, analysis),
      kpis: {
        savingsRate: {
          rate: analytics?.savingsRate ?? 0,
          status: analytics?.savingsRateStatus || 'fair'
        },
        expenseRatio: {
          ratio: analytics?.expenseRatio ?? 0,
          status: analytics?.expenseRatioStatus || 'fair'
        }
      },
      recommendations: rules.recommendations || [],
      analysis: {
        totalSpent: analysis.totalSpent || 0,
        categories: [...sortedCategories],  // Explicitly copy the array
        categoryBreakdown: { ...sortedCategoryBreakdown },  // Explicitly copy the object
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
      categoriesCount: responseData.analysis.categories.length,
      categoriesArray: responseData.analysis.categories,
      categoryBreakdownKeys: Object.keys(responseData.analysis.categoryBreakdown),
      fullCategoryBreakdown: responseData.analysis.categoryBreakdown
    });

    // Add cache-busting headers
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(responseData);

  } catch (err) {
    console.error('❌ [ERROR] Health analysis failed:', err.message);
    console.error('❌ [ERROR] Stack trace:', err.stack);

    // Return error response instead of hardcoded demo data
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial health analysis',
      error: err.message
    });
  }
});

// Helper function to generate default summary
function generateDefaultSummary(rules, analysis) {
  const score = rules.summary?.overallHealthScore || 0;
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

    // Return error response instead of hardcoded fallback data
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data',
      error: err.message
    });
  }
});

module.exports = router;

