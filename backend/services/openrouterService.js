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

      // Detect if the question is finance-related
      const isFinanceRelated = this.isFinanceRelatedQuestion(question);
      const prompt = this.buildPrompt(question, analysis, rules, context, isFinanceRelated);
      
      // Get conversation history from context (if available)
      const conversationHistory = context.conversationHistory || [];
      
      // Use different system prompts based on question type
      const systemPrompt = isFinanceRelated 
        ? `You are a professional financial advisor providing personalized financial guidance. 
Your role is to analyze user spending patterns and provide tailored, actionable financial advice.
Be helpful, accurate, and conservative with recommendations. Consider risk tolerance and provide balanced advice.
Format your response with clear sections, bullet points, and specific numbers when relevant.
Always reference the user's actual financial data (income, expenses, savings) in your recommendations.
Remember the context of previous messages in this conversation.`
        : `You are a helpful AI assistant integrated into a financial advisor app called FinAdvisor.
You can answer general questions, have casual conversations, and provide helpful information on any topic.
When the user asks about finance, money, investments, budgeting, or their personal finances, you'll have access to their financial data.
For non-financial questions, respond naturally and helpfully like a knowledgeable assistant.
Keep responses concise but informative. Use markdown formatting when appropriate.
Remember the context of previous messages in this conversation and refer back to them when relevant.`;

      // Build messages array with conversation history
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        // Include previous conversation messages for context
        ...conversationHistory,
        // Add current user message
        {
          role: 'user',
          content: prompt
        }
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'openai/gpt-4-turbo',
        messages: messages,
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

  /**
   * Detect if a question is related to personal finance
   * @param {string} question - The user's question
   * @returns {boolean} - Whether the question is finance-related
   */
  isFinanceRelatedQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Finance-related keywords
    const financeKeywords = [
      // Direct finance terms
      'money', 'spend', 'spending', 'expense', 'expenses', 'budget', 'budgeting',
      'save', 'saving', 'savings', 'invest', 'investing', 'investment',
      'income', 'salary', 'earn', 'earnings', 'debt', 'loan', 'credit',
      'finance', 'financial', 'bank', 'account', 'transaction',
      // Actions related to finance
      'afford', 'cost', 'price', 'pay', 'payment', 'bill', 'bills',
      'tax', 'taxes', 'retirement', 'pension', 'insurance',
      'stock', 'stocks', 'mutual fund', 'sip', 'fd', 'fixed deposit',
      // Personal finance questions
      'my money', 'my expenses', 'my spending', 'my budget', 'my savings',
      'my income', 'my salary', 'my finances', 'my financial',
      'how much', 'where did', 'what did i spend', 'am i spending',
      // Advice seeking
      'should i buy', 'can i afford', 'is it worth', 'save more',
      'reduce spending', 'cut costs', 'financial advice', 'money advice',
      'financial goal', 'financial health', 'emergency fund',
      // Categories
      'food expense', 'transport expense', 'utility', 'utilities',
      'entertainment expense', 'health expense', 'education expense'
    ];

    // Check if any finance keyword is in the question
    const hasFinanceKeyword = financeKeywords.some(keyword => 
      lowerQuestion.includes(keyword)
    );

    // Also check for question patterns about personal data
    const personalFinancePatterns = [
      /how (much|many).*(spend|spent|save|saved|earn|earned)/i,
      /what.*(my|i).*(spend|expense|budget|saving|income)/i,
      /where.*(my|i).*(money|spend)/i,
      /show.*(my|me).*(expense|spending|budget|saving)/i,
      /analyze.*(my|expense|spending|finance)/i,
      /advice.*(money|finance|invest|save|budget)/i,
      /tip.*(save|saving|money|budget|spend)/i
    ];

    const matchesPattern = personalFinancePatterns.some(pattern => 
      pattern.test(question)
    );

    return hasFinanceKeyword || matchesPattern;
  }

  buildPrompt(question, analysis, rules, context, isFinanceRelated = true) {
    // For non-finance questions, just return the question directly
    if (!isFinanceRelated) {
      return `User's question: "${question}"

Please answer this question helpfully and concisely. This is a general question, not specifically about the user's personal finances.`;
    }

    // For finance-related questions, include the full financial context
    const {
      totalSpent = 0,
      categoryBreakdown = {},
      averages = {},
      timeframes = {},
      userProfile = {}
    } = analysis;

    const { summary = {}, alerts = [], recommendations = [] } = rules;

    // Calculate key metrics
    const monthlyIncome = (userProfile.income || 0) / 12;
    const monthlyExpenses = timeframes.last30Days || totalSpent || 0;
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
- Monthly Expenses (Last 30 Days): ₹${Math.round(monthlyExpenses).toLocaleString('en-IN')}
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
