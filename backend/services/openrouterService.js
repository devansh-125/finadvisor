/**
 * OpenRouter Financial Advisor Service
 * Uses Perplexity Sonar for real-time web search (stock prices, news)
 * Uses GPT-4 Turbo for personal finance analysis
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
        console.log('✅ OpenRouter API initialized');
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

  /**
   * Check if question needs real-time web search (stock prices, current news, etc.)
   */
  needsWebSearch(question) {
    const lowerQuestion = question.toLowerCase();
    
    const webSearchPatterns = [
      // Stock/Market prices
      /\b(stock|share|market)\s*(price|rate|value|today|current|now|live)/i,
      /\b(price|rate|value)\s*(of|for).*(stock|share|nse|bse)/i,
      /\b(today|current|now|live|latest)\s*(price|rate|market|stock)/i,
      /\b(nse|bse|nasdaq|nyse)\s*(price|rate)/i,
      // Specific stock symbols
      /\b(reliance|tcs|infosys|hdfc|icici|sbi|tata|wipro|bharti|itc|kotak)\b.*\b(price|stock|share)/i,
      /\b(tesla|apple|google|amazon|microsoft|nvidia|meta)\b.*\b(price|stock|share)/i,
      // Current/today keywords with financial terms
      /what.*(today|current|now).*(price|rate|stock|market)/i,
      /tell me.*(today|current|live).*(price|stock|market)/i,
      // News and updates
      /\b(latest|recent|today|current)\s*(news|update|announcement)/i,
      /what.*(happening|news|update).*(market|stock|economy)/i,
    ];

    return webSearchPatterns.some(pattern => pattern.test(question));
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
      
      // Detect if we need real-time web search
      const needsRealTimeData = this.needsWebSearch(question);
      
      // Choose model based on need
      // perplexity/sonar-pro has web search for real-time data
      // openai/gpt-4-turbo is better for personal finance analysis
      const model = needsRealTimeData ? 'perplexity/sonar-pro' : 'openai/gpt-4-turbo';
      console.log(`🤖 Using model: ${model} (needsRealTimeData: ${needsRealTimeData})`);
      
      const prompt = this.buildPrompt(question, analysis, rules, context, isFinanceRelated, needsRealTimeData);
      
      // Get conversation history from context (if available)
      const conversationHistory = context.conversationHistory || [];
      
      // System prompt for web search model
      const webSearchPrompt = `You are a financial research assistant with real-time web access.

TASK: Search the web and provide CURRENT, LIVE data for the user's query.

FOR STOCK PRICES:
- Search for the CURRENT stock price from NSE/BSE India or relevant exchange
- Include: Current price, today's change (%), day's high/low
- Mention the time of the data (e.g., "As of 3:30 PM IST")
- Use reliable sources: NSE India, BSE India, Google Finance, Yahoo Finance

FOR MARKET NEWS:
- Get the latest news and updates
- Include dates and sources

FORMATTING:
- Use clear markdown headers
- Bold important numbers: **₹1,234.56**
- Include percentage changes with color indicators (📈 for up, 📉 for down)
- Always cite your sources`;

      // System prompt for personal finance
      const financePrompt = `You are an expert personal financial advisor in the FinAdvisor app.
You have access to the user's real financial data provided below.

HOW TO RESPOND:
1. First, directly answer what the user asked
2. Then, relate it to their personal financial situation with specific numbers
3. Give actionable advice with exact ₹ amounts from their data
4. For stocks/investments:
   - Analyze if it fits their budget based on their surplus
   - Give pros and cons specific to THEIR financial situation
   - Suggest realistic investment amounts

FORMATTING:
- Use proper markdown with ## headers
- Bold important numbers with **₹X,XXX**
- Use consistent bullet points (-)`;

      // System prompt for general questions
      const generalPrompt = `You are a knowledgeable AI assistant in the FinAdvisor app.
Answer the user's question directly and thoroughly.
Use markdown formatting for clarity.`;

      // Choose appropriate system prompt
      let systemPrompt;
      if (needsRealTimeData) {
        systemPrompt = webSearchPrompt;
      } else if (isFinanceRelated) {
        systemPrompt = financePrompt;
      } else {
        systemPrompt = generalPrompt;
      }

      // Build messages array with conversation history
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        // Include previous conversation messages for context (limit for Perplexity)
        ...(needsRealTimeData ? conversationHistory.slice(-4) : conversationHistory),
        // Add current user message
        {
          role: 'user',
          content: prompt
        }
      ];

      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: messages,
        temperature: needsRealTimeData ? 0.3 : 0.7, // Lower temp for factual data
        max_tokens: needsRealTimeData ? 1500 : 1200
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
        model: model,
        confidence: 0.95,
        isFinanceRelated: isFinanceRelated,
        needsRealTimeData: needsRealTimeData,
        metadata: {
          provider: 'openrouter',
          model: model,
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

  buildPrompt(question, analysis, rules, context, isFinanceRelated = true, needsRealTimeData = false) {
    // For web search queries (real-time stock prices), just ask directly
    if (needsRealTimeData) {
      return `${question}

Please search the web for the current/live data and provide accurate, up-to-date information.
For Indian stocks, check NSE/BSE. For US stocks, check NASDAQ/NYSE.
Include the current price, today's change, and the time of the data.`;
    }
    
    // For non-finance questions, just return the question
    if (!isFinanceRelated) {
      return question;
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
${stockDataFormatted ? stockDataFormatted : ''}
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
1. First, answer the user's question directly using the REAL stock prices above (if provided)
2. Then, analyze how it applies to THEIR specific financial situation
3. If about investments/stocks:
   - Use the ACTUAL current prices shown above
   - Calculate how many shares they can buy with their surplus
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
