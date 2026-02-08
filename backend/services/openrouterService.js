

// OpenRouter Financial Service: Integrates Perplexity (Search) and GPT-4 (Analysis)
const { OpenAI } = require('openai');

class OpenAIFinancialService {
  constructor() {
    this.openai = null;
    this.initializeProvider();
  }

  initializeProvider() {
    if (!process.env.OPENROUTER_API_KEY) console.warn('Missing OPENROUTER_API_KEY');
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY?.trim() || '',
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  // Detects if query requires real-time data (stocks, news, shopping)
  needsWebSearch(question) {
    if (!question) return false;
    const lower = question.toLowerCase();
    
    // Explicit prefixes
    if (lower.startsWith('search web:') || lower.startsWith('find online:')) return true;

    const patterns = [
      // Explicit search intent
      /\b(check|search|look|find|browse|google|lookup)\s*(it\s*)?(on|the|online|web|internet|for me)/i,
      /\b(search|browse|lookup|google|find)\s*(for|about|on)/i,
      /\b(online|web|internet)\s*(search|check|find|lookup|price)/i,
      /\bsearch\b/i,
      
      // Shopping & Prices
      /\b(price|cost|rate)\s*(of|for|on|comparison|compare)/i,
      /\b(compare|comparison)\s*(price|cost|rate)/i,
      /\b(lowest|cheapest|best|highest)\s*(price|cost|deal|offer)/i,
      /\b(where|which)\s*(is|has|to buy|can i).*(cheap|lowest|best|price)/i,
      /\b(buy|purchase|order)\s*(from|on|at).*(amazon|flipkart|ebay|online)/i,
      /\b(amazon|flipkart|myntra|ebay|aliexpress|meesho|snapdeal)\b/i,
      /\b(earbuds?|headphones?|phone|laptop|tv|watch|camera|tablet)\b.*\b(price|cost|buy|cheap)/i,
      
      // Markets (Stocks, Crypto, Indices)
      /\b(stock|share|market)\s*(price|rate|value|today'?s?|current|now|live)/i,
      /\b(today'?s?|current|now|live|latest|real-?time)\s*(price|rate|market|stock)/i,
      /\b(nse|bse|nasdaq|nyse|sensex|nifty)\b/i,
      /\b(reliance|tcs|infosys|hdfc|icici|sbi|tata|wipro|bharti|itc|kotak|airtel)\b/i,
      /\b(tesla|apple|google|amazon|microsoft|nvidia|meta|facebook|netflix)\b/i,
      /\b(bitcoin|btc|ethereum|eth|crypto|dogecoin|solana)\b/i,
      
      // News & Live Info
      /\b(latest|recent|today|current|breaking)\s*(news|update|announcement|review)/i,
      /\b(current|today|now|live|real-?time)\b.*\b(weather|score|result|status)\b/i,
    ];

    return patterns.some(p => p.test(question));
  }

  // Determines if query relates to user's personal finances
  isFinanceRelatedQuestion(question) {
    if (!question) return false;
    const lower = question.toLowerCase();
    
    // Filter out general entity questions unless "my/I" is present
    const externalEntities = [
      /who is|who are|who was/i,
      /what is.*(company|stock|tesla|apple|google|amazon|microsoft|reliance|tata)/i,
      /tell me about.*(him|her|them|it|company|person|ceo|founder)/i,
    ];
    
    const isExternal = externalEntities.some(p => p.test(question));
    const isPersonal = /\b(my|i |i'm|i've|i'd|me |mine)\b/i.test(question);
    
    if (isExternal && !isPersonal) return false;
    
    // Check for personal finance keywords or patterns
    const keywords = [
      'my money', 'my expenses', 'my spending', 'my budget', 'my savings',
      'my income', 'my salary', 'my finances', 'my debt', 'my investment',
      'i spend', 'i save', 'i earn', 'i owe', 'i invested',
      'can i afford', 'how do i save', 'analyze my', 'review my',
    ];

    const patterns = [
      /how (much|many).*(did )?(i |my )(spend|spent|save|saved|earn|earned)/i,
      /show.*(my|me).*(expense|spending|budget|saving|data|analysis)/i,
      /help me.*(save|budget|spend|invest|manage)/i,
    ];

    return keywords.some(k => lower.includes(k)) || patterns.some(p => p.test(question));
  }

  // Main handler: Routing, Prompting, and Execution
  async generateFinancialAdvice(question, analysis = {}, rules = {}, conversationHistory = []) {
    try {
      const needsRealTime = this.needsWebSearch(question);
      const isFinance = this.isFinanceRelatedQuestion(question);
      
      // Use Perplexity for live data, GPT-4 for analysis
      const model = needsRealTime ? 'perplexity/sonar-reasoning-pro' : 'openai/gpt-4-turbo';

      // Define System Prompts
      const searchPrompt = `You are an intelligent assistant with real-time web access. Current Date: ${new Date().toLocaleDateString()}. Search for accurate, latest info. If asking for prices, provide live values. Cite sources.`;

      const financePrompt = `You are an expert financial advisor. Use the provided user data. 1. Answer directly. 2. Relate to user's income/surplus. 3. Suggest specific amounts. 4. Analyze affordability. Use Markdown.`;

      const generalPrompt = `You are a helpful AI assistant. Answer clearly and concisely.`;

      // Select Prompt
      let systemPrompt = needsRealTime ? searchPrompt : (isFinance ? financePrompt : generalPrompt);

      // Prepare API Payload
      const messages = [
        { role: 'system', content: systemPrompt },
        ...(conversationHistory.slice(-4)), // Keep context minimal
        { role: 'user', content: this.buildPrompt(question, analysis, rules, isFinance, needsRealTime) }
      ];

      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: messages,
        temperature: needsRealTime ? 0.2 : 0.7, // Lower temp for factual data
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('Empty response from OpenRouter');

      return {
        response,
        model,
        isFinanceRelated: isFinance,
        needsRealTimeData: needsRealTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('OpenRouter API error:', error.message);
      throw error;
    }
  }

  // Injects financial context into the prompt if needed
  buildPrompt(question, analysis, rules, isFinance, needsRealTime) {
    if (needsRealTime) return `${question}\n\nProvide up-to-date info. For markets, include live price and change.`;
    if (!isFinance) return question;

    // Extract User Data
    const { totalSpent = 0, categoryBreakdown = {}, timeframes = {}, userProfile = {} } = analysis;
    const { summary = {} } = rules;

    const income = parseFloat(userProfile.income) || 0;
    const expenses = timeframes.last30Days || totalSpent || 0;
    const surplus = income - expenses;
    const savings = parseFloat(userProfile.savings) || 0;
    const savingsRate = income > 0 ? Math.round((surplus / income) * 100) : 0;

    const topCats = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a).slice(0, 3)
      .map(([c, v]) => `${c}: ₹${Math.round(v).toLocaleString('en-IN')}`).join(', ');

    return `
USER FINANCIAL DATA:
• Income: ₹${Math.round(income).toLocaleString('en-IN')} | Expenses: ₹${Math.round(expenses).toLocaleString('en-IN')}
• Surplus: ₹${Math.round(surplus).toLocaleString('en-IN')} | Savings: ₹${Math.round(savings).toLocaleString('en-IN')}
• Rate: ${savingsRate}% | Score: ${summary.overallHealthScore || 'N/A'}
• Top Spend: ${topCats} | Goals: ${userProfile.goals?.join(', ') || 'None'}

QUESTION: "${question}"
INSTRUCTIONS: Answer specifically for this user. Can they afford it? How much to allocate from surplus? Provide numbers.`;
  }
}

let instance = null;
const getOpenAIService = () => instance || (instance = new OpenAIFinancialService());

module.exports = { OpenAIFinancialService, getOpenAIService };