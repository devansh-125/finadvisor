const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const getExpense = () => require('../models/Expense')();
const getUser = () => require('../models/User')();
const getTransactionAnalyzer = () => require('../services/transactionAnalyzer');
const getRuleEngine = () => require('../services/ruleEngine');
const getOpenAIServiceModule = () => require('../services/openaiService');
const getFinancialAnalytics = () => require('../services/financialAnalytics');
const getFinancialDataService = () => require('../services/financialDataService');
const getAIQuery = () => require('../models/AIQuery')();
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// AI Query endpoint using OpenAI API
router.post('/query', auth, async (req, res) => {
  console.log('🔍 ===== QUERY ENDPOINT CALLED =====');
  console.log('🔍 Question received:', req.body.question);
  console.log('🔍 Conversation ID:', req.body.conversationId);

  try {
    const { question, conversationId } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Layer 1: Analyze transactions
    const TransactionAnalyzer = getTransactionAnalyzer();
    const analysis = await TransactionAnalyzer.analyzeExpenses(req.user._id);

    if (analysis.totalExpenses === 0) {
      return res.json({
        response: "I don't have any expense data to analyze yet. Start by adding some expenses to get personalized financial advice!",
        metadata: {
          totalExpenses: 0,
          totalSpent: 0,
          last30Days: 0,
          topCategory: 'N/A',
        },
      });
    }

    // Layer 2: Apply business rules
    const RuleEngine = getRuleEngine();
    const rules = RuleEngine.applyRules(analysis);

    // Layer 3: Calculate advanced financial KPIs
    const FinancialAnalytics = getFinancialAnalytics();
    const financialAnalyticsInstance = new FinancialAnalytics();
    const kpis = financialAnalyticsInstance.calculateKPIs(analysis, rules);

    // Layer 4: Get market data for context (if relevant to question)
    const questionLower = question.toLowerCase();
    const needsMarketData = questionLower.includes('market') ||
                           questionLower.includes('investment') ||
                           questionLower.includes('stock') ||
                           questionLower.includes('economy');

    let marketData = null;
    if (needsMarketData) {
      const FinancialDataService = getFinancialDataService();
      const financialDataServiceInstance = new FinancialDataService();
      marketData = await financialDataServiceInstance.getMarketData();
    }

    // Layer 5: Generate AI advice
    const context = {
      kpis,
      marketData,
      additionalContext: needsMarketData ? 'Include relevant market context in your response.' : null
    };

    const aiServiceModule = getOpenAIServiceModule();
    const { getOpenAIService } = aiServiceModule;
    const aiService = getOpenAIService();
    const aiResult = await aiService.generateFinancialAdvice(question, analysis, rules, context);
    const aiResponse = aiResult.response;

    // Handle Conversation Tracking
    let currentConversationId = conversationId;
    let chatTitle = 'New Chat';

    if (!currentConversationId) {
      currentConversationId = uuidv4();
      // Generate a short title from the first question
      chatTitle = question.length > 30 ? question.substring(0, 30) + '...' : question;
    } else {
      // Try to find existing title
      const existingQuery = await getAIQuery().findOne({ conversationId: currentConversationId });
      if (existingQuery) {
        chatTitle = existingQuery.title;
      }
    }

    // Save the interaction to database
    const AIQuery = getAIQuery();
    const newQuery = new AIQuery({
      user: req.user._id,
      conversationId: currentConversationId,
      title: chatTitle,
      question,
      response: aiResponse,
      metadata: {
        totalSpent: analysis.totalSpent,
        healthScore: rules.summary.overallHealthScore,
        model: aiResult.model
      }
    });
    await newQuery.save();

    res.json({ 
      success: true,
      response: aiResponse,
      conversationId: currentConversationId,
      metadata: newQuery.metadata
    });

  } catch (err) {
    console.error('❌ [ERROR] AI Query failed:', err.message);
    
    // Return structured error for frontend
    res.status(500).json({
      success: false,
      error: {
        message: err.message || 'Failed to get response from AI',
        code: 'AI_QUERY_ERROR',
        layer: 'AI_ROUTE',
        details: err.stack?.split('\n')[1]?.trim()
      }
    });
  }
});

// Get all chat conversations for the user
router.get('/history', auth, async (req, res) => {
  try {
    const conversations = await getAIQuery().aggregate([
      { $match: { user: req.user._id } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          title: { $first: "$title" },
          lastMessageAt: { $first: "$createdAt" }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);
    res.json({ success: true, conversations });
  } catch (err) {
    console.error('❌ [ERROR] Failed to fetch chat history:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
  }
});

// Get messages for a specific conversation
router.get('/history/:conversationId', auth, async (req, res) => {
  try {
    const messages = await getAIQuery().find({ 
      user: req.user._id, 
      conversationId: req.params.conversationId 
    }).sort({ createdAt: 1 });
    
    res.json({ success: true, messages });
  } catch (err) {
    console.error('❌ [ERROR] Failed to fetch conversation:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
});

// Delete a conversation
router.delete('/history/:conversationId', auth, async (req, res) => {
  try {
    await getAIQuery().deleteMany({ 
      user: req.user._id, 
      conversationId: req.params.conversationId 
    });
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    console.error('❌ [ERROR] Failed to delete conversation:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete conversation' });
  }
});

// Test endpoint to see all user expenses
router.get('/debug-expenses', auth, async (req, res) => {
  try {
    const expenses = await getExpense().find({ user: req.user._id }).sort({ date: -1 });
    
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
    const expenses = await getExpense().find({ user: req.user._id });
    
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
    let expenses = await getExpense().find({ user: req.user._id }).sort({ date: -1 });
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
    const TransactionAnalyzer2 = getTransactionAnalyzer();
    const analysis = await TransactionAnalyzer2.analyzeExpenses(req.user._id);
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
    const RuleEngine2 = getRuleEngine();
    const rules = RuleEngine2.applyRules(analysis);
    console.log('🏥 Rule engine applied');
    console.log('🏥 Health score:', rules.summary?.overallHealthScore);

    // Get financial analytics
    const FinancialAnalyticsClass = getFinancialAnalytics();
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
    const FinancialDataService = getFinancialDataService();
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

