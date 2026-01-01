/**
 * OpenRouter Financial Advisor Service
 * Provides AI-powered financial advice using OpenRouter API (Mixtral model)
 */

const { OpenAI } = require('openai');

class OpenAIFinancialService {
  constructor() {
    this.openai = null;
    this.initializeProvider();
  }

  async initializeProvider() {
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '') {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENROUTER_API_KEY.trim(),
          baseURL: 'https://openrouter.ai/api/v1'
        });
        console.log('✅ OpenRouter API initialized with GPT-4 Turbo');
      } catch (err) {
        console.error('OpenRouter initialization failed:', err.message);
        this.openai = null;
        throw new Error('OpenRouter initialization failed: ' + err.message);
      }
    } else {
      console.error('OPENROUTER_API_KEY not found in environment variables');
      this.openai = null;
      throw new Error('OPENROUTER_API_KEY is required');
    }
  }

  async generateFinancialAdvice(question, analysis, rules, context = {}) {
    try {
      if (!this.openai) {
        const error = new Error('OpenAI API not initialized');
        error.code = 'OPENAI_NOT_INITIALIZED';
        error.details = 'OPENROUTER_API_KEY is missing or empty';
        error.layer = 'AI Service';
        throw error;
      }

      const prompt = this.buildPrompt(question, analysis, rules, context);

      const completion = await this.openai.chat.completions.create({
        model: 'openai/gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional financial advisor providing personalized financial guidance. 
Your role is to analyze user spending patterns and provide tailored, actionable financial advice.
Be helpful, accurate, and conservative with recommendations. Consider risk tolerance and provide balanced advice.
Format your response with clear sections, bullet points, and specific numbers when relevant.
Always reference the user's actual financial data (income, expenses, savings) in your recommendations.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        const error = new Error('OpenRouter returned empty response');
        error.code = 'OPENROUTER_EMPTY_RESPONSE';
        error.details = 'Response content was missing from API response';
        throw error;
      }

      return {
        response: response,
        model: 'openai/gpt-4-turbo',
        confidence: 0.95,
        metadata: {
          provider: 'openrouter',
          model: 'openai/gpt-4-turbo',
          tokens: completion.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('OpenRouter API error:', error.message);
      error.layer = error.layer || 'AI Service';
      throw error;
    }
  }

  buildPrompt(question, analysis, rules, context) {
  const {
    totalSpent = 0,
    categoryBreakdown = {},
    averages = {},
    userProfile = {}
  } = analysis;

  const { summary = {}, alerts = [], recommendations = [] } = rules;

  // Calculate key metrics
  const monthlyIncome = (userProfile.income || 0) / 12;
  const monthlyExpenses = averages.monthly || totalSpent || 0;
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySurplus / monthlyIncome) * 100) : 0;

    // Get top spending categories
    const topCategories = Object.entries(categoryBreakdown || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amt]) => `${cat}: ₹${Math.round(amt).toLocaleString('en-IN')}`)
      .join(', ');

    const financialContext = `
USER FINANCIAL PROFILE:
- Monthly Income: ₹${Math.round(monthlyIncome).toLocaleString('en-IN')}
- Monthly Expenses: ₹${Math.round(monthlyExpenses).toLocaleString('en-IN')}
- Monthly Surplus/Deficit: ₹${Math.round(monthlySurplus).toLocaleString('en-IN')}
- Savings Rate: ${savingsRate}%
- Total Savings: ₹${(userProfile.savings || 0).toLocaleString('en-IN')}
- Financial Health Score: ${summary.overallHealthScore || 70}/100
- Top Spending Categories: ${topCategories}
- Current Alerts: ${alerts.length > 0 ? alerts.join(', ') : 'None'}

USER'S QUESTION:
"${question}"

Please provide personalized financial advice based on this user's specific situation above.
Include actionable steps they can take and reference their actual numbers when relevant.
Format response with sections, bullet points, and markdown for clarity.`;

    return financialContext;
  }
}

let instance = null;

function getOpenAIService() {
  if (!instance) {
    instance = new OpenAIFinancialService();
  }
  return instance;
}

module.exports = { OpenAIFinancialService, getOpenAIService };
