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
        ? `You are an expert personal financial advisor in the FinAdvisor app.
You have access to the user's real financial data provided below.

HOW TO RESPOND:
1. First, directly answer what the user asked
2. Then, relate it to their personal financial situation with specific numbers
3. Give actionable advice with exact ₹ amounts from their data
4. For stocks/investments:
   - Explain the investment opportunity clearly
   - Analyze if it fits their budget based on their surplus
   - Give pros and cons specific to THEIR financial situation
   - Suggest realistic investment amounts (e.g., "With your ₹X surplus, you could invest ₹Y monthly")

IMPORTANT LIMITATIONS:
- You don't have real-time stock prices. Say "As of my last update" or "Check current prices on NSE/BSE"
- For current prices, suggest checking apps like Groww, Zerodha, or Google Finance

FORMATTING:
- Use proper markdown with ## headers, bullet points (- or *)
- Bold important numbers with **₹X,XXX**
- Keep responses well-structured and easy to read
- Use consistent bullet style (either all - or all •, not mixed)`
        : `You are a knowledgeable AI assistant in the FinAdvisor app.

HOW TO RESPOND:
1. Answer the user's question directly and thoroughly
2. For stocks/companies/investments:
   - Provide factual information about the company
   - Note that you don't have real-time prices (suggest checking Groww, Zerodha, Google Finance)
   - If they want personalized advice, they can ask "should I invest based on my finances?"
3. Be conversational and helpful

IMPORTANT: You don't have access to real-time stock prices or market data. Always clarify this and suggest checking live sources.

FORMATTING:
- Use proper markdown with ## headers
- Use consistent bullet points (- not •)
- Bold **important terms**
- Keep it clean and readable`;

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
        isFinanceRelated: isFinanceRelated, // Include whether this was a finance question
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
   * Detect if a question is about the USER'S PERSONAL finances
   * vs general questions (even about finance topics like stocks, companies, etc.)
   * @param {string} question - The user's question
   * @returns {boolean} - Whether the question is about USER's personal finance
   */
  isFinanceRelatedQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    // EXCLUDE: Questions about external entities (companies, people, general knowledge)
    const externalEntityPatterns = [
      /who is|who are|who was/i,
      /what is .*(company|stock|tesla|apple|google|amazon|microsoft|reliance|tata)/i,
      /tell me about .*(him|her|them|it|company|person|ceo|founder)/i,
      /his |her |their |its /i,  // Referring to someone/something else
      /(elon|musk|ambani|bezos|gates|zuckerberg|buffett)/i,  // Famous people
      /^(what|who|when|where|why|how) (is|are|was|were|did|does|do) (the|a|an|this|that)/i,
    ];
    
    const isAboutExternalEntity = externalEntityPatterns.some(pattern => 
      pattern.test(question)
    );
    
    // If asking about external entity AND not mentioning "my" or "I", it's NOT personal finance
    const mentionsPersonal = /\b(my|i |i'm|i've|i'd|me |mine)\b/i.test(question);
    
    if (isAboutExternalEntity && !mentionsPersonal) {
      return false;
    }
    
    // PERSONAL finance keywords - must be about USER's money
    const personalFinanceKeywords = [
      'my money', 'my expenses', 'my spending', 'my budget', 'my savings',
      'my income', 'my salary', 'my finances', 'my financial', 'my debt',
      'my account', 'my investment', 'my portfolio',
      'i spend', 'i spent', 'i save', 'i saved', 'i earn', 'i earned',
      'i owe', 'i paid', 'i bought', 'i invested',
      'am i spending', 'should i save', 'should i invest', 'should i buy',
      'can i afford', 'how do i save', 'how can i save', 'help me save',
      'reduce my', 'cut my', 'improve my', 'analyze my', 'review my',
    ];

    const hasPersonalKeyword = personalFinanceKeywords.some(keyword => 
      lowerQuestion.includes(keyword)
    );
    
    // Patterns that indicate PERSONAL finance questions
    const personalFinancePatterns = [
      /how (much|many).*(did )?(i |my )(spend|spent|save|saved|earn|earned)/i,
      /what.*(did )?(i |my ).*(spend|expense|budget|saving|income)/i,
      /where.*(did )?(i |my ).*(money|spend)/i,
      /show.*(my|me).*(expense|spending|budget|saving|data|analysis)/i,
      /analyze.*(my|me)/i,
      /give me.*(advice|tips|suggestion).*(money|finance|save|budget|spend)/i,
      /help me.*(save|budget|spend|invest|manage)/i,
      /(advice|tips|suggestion) for (my|me)/i,
      /based on my/i,
      /according to my/i,
      /looking at my/i,
    ];

    const matchesPattern = personalFinancePatterns.some(pattern => 
      pattern.test(question)
    );

    return hasPersonalKeyword || matchesPattern;
  }

  buildPrompt(question, analysis, rules, context, isFinanceRelated = true) {
    // For non-finance questions, just return the question directly - NO financial data
    if (!isFinanceRelated) {
      return question; // Just the raw question, no financial context
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
USER'S FINANCIAL DATA:
━━━━━━━━━━━━━━━━━━━━━
• Monthly Income: ₹${Math.round(monthlyIncome).toLocaleString('en-IN')}
• Monthly Expenses: ₹${Math.round(monthlyExpenses).toLocaleString('en-IN')}
• Monthly Surplus (Available to Save/Invest): ₹${Math.round(monthlySurplus).toLocaleString('en-IN')}
• Current Savings: ₹${(userProfile.savings || 0).toLocaleString('en-IN')}
• Savings Rate: ${savingsRate}%
• Financial Health Score: ${summary.overallHealthScore || 70}/100
• Top Spending: ${topCategories}
• User's Goals: ${userProfile.goals?.join(', ') || 'Not specified'}

USER'S QUESTION:
"${question}"

INSTRUCTIONS:
1. First, answer the user's question directly
2. Then, analyze how it applies to THEIR specific financial situation above
3. If about investments/stocks:
   - Can they afford it with ₹${Math.round(monthlySurplus).toLocaleString('en-IN')} monthly surplus?
   - What amount would be safe to invest (usually 10-20% of surplus)?
   - Pros and cons for THEIR income level
   - Risk assessment based on their savings buffer
4. Give specific actionable advice with exact ₹ amounts
5. Use clear headers and bullet points`;

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
