const express = require('express');
const OpenAI = require('openai');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const User = require('../models/User');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI financial query - enhanced with user profile and spending analytics
router.post('/query', auth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Get user's full profile data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's expenses for context (last 100)
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).limit(100);

    // Calculate spending analytics
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentSpent = expenses
      .filter(exp => new Date(exp.date) >= last30Days)
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    const expenseContext = expenses.slice(0, 20).map(exp => 
      `${exp.date.toDateString()}: ${exp.category} - ${user.profile.currency}${exp.amount} - ${exp.description}`
    ).join('\n');

    // Build comprehensive context for the AI
    const userProfileContext = `
Name: ${user.name}
Age: ${user.profile?.age || 'Not provided'}
Annual Income: ${user.profile?.income ? `${user.profile.currency}${user.profile.income}` : 'Not provided'}
Current Savings: ${user.profile?.savings ? `${user.profile.currency}${user.profile.savings}` : 'Not provided'}
Financial Goals: ${user.profile?.goals?.length > 0 ? user.profile.goals.join(', ') : 'Not specified'}
Preferred Currency: ${user.profile?.currency || 'USD'}
    `;

    const spendingAnalyticsContext = `
Total Spent (all time): ${user.profile.currency}${totalSpent.toFixed(2)}
Spent Last 30 Days: ${user.profile.currency}${recentSpent.toFixed(2)}
Monthly Average: ${user.profile.currency}${(totalSpent / Math.max(1, expenses.length / 30)).toFixed(2)}
Top Spending Categories: ${Object.entries(categoryBreakdown)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([cat, amt]) => `${cat}: ${user.profile.currency}${amt.toFixed(2)}`)
  .join('; ')}
    `;

    const prompt = `You are an expert financial advisor AI. Provide personalized, actionable financial advice based on the user's profile and spending patterns.

USER PROFILE:
${userProfileContext}

SPENDING ANALYTICS:
${spendingAnalyticsContext}

RECENT EXPENSES (Last 20):
${expenseContext}

USER QUESTION: ${question}

Guidelines for your response:
- Be specific and actionable, referencing their actual spending data
- Consider their income, savings, and goals when making recommendations
- Suggest concrete steps they can take to improve their financial situation
- If relevant, point out spending patterns or areas where they could optimize
- Keep the response concise but comprehensive (3-5 paragraphs max)
- Use their preferred currency (${user.profile?.currency || 'USD'}) in examples
- Be encouraging but honest about their financial situation

Provide your personalized financial advice response:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    res.json({ 
      response,
      metadata: {
        totalExpenses: expenses.length,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        last30Days: parseFloat(recentSpent.toFixed(2)),
        topCategory: Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      }
    });
  } catch (err) {
    console.error('AI Query Error:', err);
    
    // Handle specific error types
    if (err.status === 401) {
      return res.status(401).json({ message: 'Invalid API key for AI service' });
    } else if (err.status === 429) {
      return res.status(429).json({ message: 'Too many requests to AI service. Please try again later.' });
    } else if (err.status === 500) {
      return res.status(503).json({ message: 'AI service is temporarily unavailable' });
    }
    
    res.status(500).json({ message: 'Error processing your question. Please try again.' });
  }
});

// Get AI recommendations based on spending patterns
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Get user's full profile data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's expenses
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).limit(100);

    if (expenses.length === 0) {
      return res.json({ 
        recommendations: ['Start tracking your expenses to get personalized recommendations'],
        insights: []
      });
    }

    // Calculate analytics
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentSpent = expenses
      .filter(exp => new Date(exp.date) >= last30Days)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach(exp => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    const averageMonthly = totalSpent / Math.max(1, expenses.length / 30);
    const savingsRate = user.profile?.income ? 
      ((user.profile.income - averageMonthly * 12) / user.profile.income * 100) : null;

    // Build prompt for recommendations
    const userProfileContext = `
Age: ${user.profile?.age || 'N/A'}
Annual Income: ${user.profile?.income || 'N/A'}
Current Savings: ${user.profile?.savings || 'N/A'}
Financial Goals: ${user.profile?.goals?.length > 0 ? user.profile.goals.join(', ') : 'Not specified'}
Currency: ${user.profile?.currency || 'USD'}
    `;

    const spendingContext = `
Total Spent (all time): ${totalSpent}
Average Monthly Spending: ${averageMonthly.toFixed(2)}
Last 30 Days Spending: ${recentSpent}
${savingsRate !== null ? `Estimated Savings Rate: ${savingsRate.toFixed(1)}%` : ''}
Top Spending Categories: ${Object.entries(categoryBreakdown)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([cat, amt]) => `${cat} (${(amt/totalSpent*100).toFixed(1)}%)`)
  .join(', ')}
    `;

    const prompt = `You are a financial advisor. Based on this user's profile and spending analysis, provide 3-4 specific, actionable financial recommendations.

USER PROFILE:
${userProfileContext}

SPENDING ANALYSIS:
${spendingContext}

Return your response as a JSON object with this exact structure:
{
  "recommendations": [
    {"title": "Recommendation Title", "description": "Specific actionable advice", "priority": "high|medium|low"},
    ...
  ],
  "insights": [
    "Key insight about their spending pattern",
    "Another insight"
  ]
}

Base recommendations on their actual data. Be specific and actionable.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    
    // Parse JSON response (handle potential markdown formatting)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      recommendations: [
        { 
          title: 'Continue Tracking Expenses', 
          description: 'Maintain consistent expense tracking to identify more detailed patterns',
          priority: 'medium'
        }
      ],
      insights: ['Keep monitoring your spending patterns to improve financial decisions']
    };

    res.json(parsedResponse);
  } catch (err) {
    console.error('Recommendations Error:', err);
    res.status(500).json({ message: 'Error generating recommendations' });
  }
});

module.exports = router;