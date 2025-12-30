const express = require('express');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const User = require('../models/User');
const TransactionAnalyzer = require('../services/transactionAnalyzer');
const RuleEngine = require('../services/ruleEngine');
const { getGeminiInstance } = require('../services/geminiAI');

const router = express.Router();

// AI financial query - using three-layer system:
// 1. Transaction Analyzer (extract financial data)
// 2. Rule Engine (apply hard financial rules)
// 3. Gemini AI (generate natural language advice)
router.post('/query', auth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Layer 1: Analyze transactions
    const analysis = await TransactionAnalyzer.analyzeExpenses(req.user._id);

    if (analysis.totalExpenses === 0) {
      return res.json({
        response:
          "I don't have any expense data to analyze yet. Start by adding some expenses to get personalized financial advice!",
        metadata: {
          totalExpenses: 0,
          totalSpent: 0,
          last30Days: 0,
          topCategory: 'N/A',
        },
      });
    }

    // Layer 2: Apply business rules
    const rules = RuleEngine.applyRules(analysis);

    // Layer 3: Generate AI advice using Gemini
    const gemini = getGeminiInstance();
    const aiResponse = await gemini.generateAdvice(question, analysis, rules);

    res.json({
      response: aiResponse,
      metadata: {
        totalExpenses: analysis.totalExpenses,
        totalSpent: analysis.totalSpent,
        last30Days: analysis.timeframes.last30Days,
        topCategory: Object.entries(analysis.categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
        healthScore: rules.summary.overallHealthScore,
        alerts: rules.alerts.length,
      },
    });
  } catch (err) {
    console.error('AI Query Error:', err);

    if (err.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ message: 'AI service not configured. Please set GEMINI_API_KEY.' });
    }

    res.status(500).json({ message: `Error processing your question: ${err.message}` });
  }
});

// Get AI recommendations based on spending patterns
// Uses all three layers to generate comprehensive recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Layer 1: Analyze transactions
    const analysis = await TransactionAnalyzer.analyzeExpenses(req.user._id);

    if (analysis.totalExpenses === 0) {
      return res.json({
        recommendations: ['Start tracking your expenses to get personalized recommendations'],
        insights: [],
        summary: 'No expense data available yet.',
      });
    }

    // Layer 2: Apply business rules
    const rules = RuleEngine.applyRules(analysis);

    // Layer 3: Get AI-generated recommendations using Gemini
    const gemini = getGeminiInstance();
    const aiRecommendations = await gemini.generateRecommendations(analysis, rules);

    res.json({
      recommendations: aiRecommendations.recommendations || rules.recommendations,
      insights: rules.insights,
      alerts: rules.alerts,
      healthScore: rules.summary.overallHealthScore,
      summary: aiRecommendations.summary || 'Review the recommendations above to optimize your finances.',
    });
  } catch (err) {
    console.error('Recommendations Error:', err);
    res.status(500).json({ message: `Error generating recommendations: ${err.message}` });
  }
});

// New endpoint: Get financial health analysis
router.get('/health', auth, async (req, res) => {
  try {
    // Layer 1: Analyze transactions
    const analysis = await TransactionAnalyzer.analyzeExpenses(req.user._id);

    if (analysis.totalExpenses === 0) {
      return res.json({
        healthScore: 50,
        analysis: null,
        message: 'No expense data to analyze',
      });
    }

    // Layer 2: Apply business rules
    const rules = RuleEngine.applyRules(analysis);

    res.json({
      healthScore: rules.summary.overallHealthScore,
      alerts: rules.alerts,
      insights: rules.insights,
      recommendations: rules.recommendations.slice(0, 3),
      analysis: {
        totalSpent: analysis.totalSpent,
        monthlyAverage: analysis.averages.monthly,
        last30Days: analysis.timeframes.last30Days,
        topCategories: Object.entries(analysis.categoryBreakdown)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([cat, amt]) => ({ category: cat, amount: amt })),
      },
    });
  } catch (err) {
    console.error('Health Analysis Error:', err);
    res.status(500).json({ message: 'Error analyzing financial health' });
  }
});

// New endpoint: Get transaction analysis only (for debugging)
router.get('/analysis', auth, async (req, res) => {
  try {
    const analysis = await TransactionAnalyzer.analyzeExpenses(req.user._id);
    res.json(analysis);
  } catch (err) {
    console.error('Analysis Error:', err);
    res.status(500).json({ message: 'Error analyzing transactions' });
  }
});

// New endpoint: Get rule engine insights only (for debugging)
router.get('/rules', auth, async (req, res) => {
  try {
    const analysis = await TransactionAnalyzer.analyzeExpenses(req.user._id);
    const rules = RuleEngine.applyRules(analysis);
    res.json(rules);
  } catch (err) {
    console.error('Rules Error:', err);
    res.status(500).json({ message: 'Error analyzing rules' });
  }
});

// Health check endpoint - test Gemini API connection
router.get('/test', auth, async (req, res) => {
  try {
    const gemini = getGeminiInstance();
    const result = await gemini.testConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;