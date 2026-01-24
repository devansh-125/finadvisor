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
   * Check if question needs real-time web search
   * Includes: stock prices, product prices, comparisons, news, any "search the web" request
   */
  needsWebSearch(question) {
    const lowerQuestion = question.toLowerCase();
    
    const webSearchPatterns = [
      // ===== EXPLICIT WEB SEARCH REQUESTS =====
      /\b(check|search|look|find|browse|google|lookup)\s*(it\s*)?(on|the|online|web|internet|for me)/i,
      /\b(search|browse|lookup|google|find)\s*(for|about|on)/i,
      /\b(online|web|internet)\s*(search|check|find|lookup|price)/i,
      /\bsearch\b/i,  // Any mention of "search"
      
      // ===== PRODUCT/SHOPPING SEARCHES =====
      /\b(price|cost|rate)\s*(of|for|on|comparison|compare)/i,
      /\b(compare|comparison)\s*(price|cost|rate)/i,
      /\b(lowest|cheapest|best|highest)\s*(price|cost|deal|offer)/i,
      /\b(where|which)\s*(is|has|to buy|can i).*(cheap|lowest|best|price)/i,
      /\b(buy|purchase|order)\s*(from|on|at).*(amazon|flipkart|ebay|online)/i,
      /\b(amazon|flipkart|myntra|ebay|aliexpress|meesho|snapdeal)\b/i,
      /\b(earbuds?|headphones?|phone|laptop|tv|watch|camera|tablet)\b.*\b(price|cost|buy|cheap)/i,
      /\b(price|cost|buy|cheap|best).*\b(earbuds?|headphones?|phone|laptop|tv|watch|camera|tablet)\b/i,
      
      // ===== STOCK/MARKET PRICES =====
      /\b(stock|share|market)\s*(price|rate|value|today'?s?|current|now|live)/i,
      /\b(today'?s?|current|now|live|latest|real-?time)\s*(price|rate|market|stock)/i,
      /\b(nse|bse|nasdaq|nyse|sensex|nifty)\b/i,
      
      // ===== SPECIFIC COMPANIES/STOCKS =====
      /\b(reliance|tcs|infosys|hdfc|icici|sbi|tata|wipro|bharti|itc|kotak|airtel)\b/i,
      /\b(tesla|apple|google|amazon|microsoft|nvidia|meta|facebook|netflix)\b/i,
      /\b(bitcoin|btc|ethereum|eth|crypto|dogecoin|solana)\b/i,
      
      // ===== PRICE INQUIRIES =====
      /\b(what|how much|tell).*(price|cost|rate|worth|value)\b/i,
      /\btoday'?s?\s*price/i,
      /\bprice\s*(today|now|current)/i,
      
      // ===== NEWS AND UPDATES =====
      /\b(latest|recent|today|current|breaking)\s*(news|update|announcement|review)/i,
      /what.*(happening|news|update)/i,
      
      // ===== REAL-TIME INFO =====
      /\b(current|today|now|live|real-?time)\b.*\b(weather|score|result|status)\b/i,
      /\b(weather|score|result|status)\b.*\b(current|today|now|live)\b/i,
    ];

    const matches = webSearchPatterns.some(pattern => pattern.test(question));
    // Removed debug log for cleanliness
    return matches;
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
      
      // Get conversation history from context (if available)
      const conversationHistory = context.conversationHistory || [];
      /**
       * Dynamically detect if a query should use web search (Perplexity Sonar)
       * Uses minimal keyword logic, like ChatGPT browsing: if user asks to "search", "find", "look up", "online", "web", "price", "news", "review", or starts with "search web:" or "find online:", use web search.
       */
      needsWebSearch(question) {
        const lower = question.toLowerCase();
        // Use web search if user asks for it or mentions search/web/price/news/review/etc
        if (lower.startsWith('search web:') || lower.startsWith('find online:')) return true;
        const keywords = ['search', 'find', 'look up', 'online', 'web', 'price', 'news', 'review', 'compare', 'cheapest', 'lowest', 'best deal'];
        return keywords.some(k => lower.includes(k));
      }
- Include sources for your information
- Give comprehensive answers

FORMATTING:
- Use clear markdown headers (## for sections)
- Bold important prices: **₹1,234**
- Use tables for price comparisons when helpful
- Use emojis for visual clarity: 🏷️ for deals, 📈📉 for stock changes
- Always cite your sources at the end`;

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
      /what is.*(company|stock|tesla|apple|google|amazon|microsoft|reliance|tata)/i,
      /tell me about.*(him|her|them|it|company|person|ceo|founder)/i,
      /his|her|their|its/i,
      /(elon|musk|ambani|bezos|gates|zuckerberg|buffett)/i,
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
