/**
 * Advanced AI Service - Multi-Model Integration
 * Combines multiple AI models for enhanced financial analysis
 * Includes machine learning predictions and advanced analytics
 */

const Groq = require('groq-sdk');
const {
  performSemanticAnalysis,
  classifyQuestionType,
  analyzeQuestionIntent,
  extractTopicsSemantically,
  recognizeFinancialConcepts,
  calculateConfidenceScore
} = require('./semanticAnalysis');

class AdvancedAIService {
  constructor() {
    // Initialize Groq AI provider only
    this.groq = null;

    this.initializeProviders();
  }

  async initializeProviders() {
    // Only Groq AI (free and fast)
    console.log('🔍 Checking GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'PRESENT' : 'MISSING');

    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
      try {
        this.groq = new Groq({
          apiKey: process.env.GROQ_API_KEY.trim()
        });
        console.log('🚀 Groq AI initialized successfully (FREE tier)');
        console.log('🎯 Groq object created and ready');
      } catch (err) {
        console.error('❌ Groq initialization failed:', err.message);
        this.groq = null;
        throw new Error('Groq initialization failed: ' + err.message);
      }
    } else {
      console.error('❌ GROQ_API_KEY not found or empty in environment variables');
      console.log('💡 Please add GROQ_API_KEY to your .env file');
      console.log('🔗 Get your free key at: https://console.groq.com/');
      this.groq = null;
      throw new Error('GROQ_API_KEY is required. Get your free key at https://console.groq.com/');
    }
  }


  /**
   * Smart AI routing - chooses best model for the task
   */
  async generateFinancialAdvice(question, analysis, rules, context = {}) {
    console.log('🚨 🚨 🚨 GENERATE FINANCIAL ADVICE METHOD CALLED 🚨 🚨 🚨');
    console.log('🚨 QUESTION RECEIVED:', question);
    console.log('🔍 [LAYER 3 - AI Service] Starting AI advice generation...');
    console.log('🔍 [LAYER 3 - AI Service] Question:', question);

    try {
      const { complexity, requiresCreativity, needsRealTime } = this.analyzeQueryComplexity(question);
      console.log('🔍 [LAYER 3 - AI Service] Question complexity:', complexity);

      // Check if any AI providers are available
      const hasAnyProvider = this.groq || this.gemini || this.openai || this.huggingface;
      console.log('🔍 [LAYER 3 - AI Service] Available providers - Groq:', !!this.groq, 'Gemini:', !!this.gemini);

      if (!hasAnyProvider) {
        console.log('🔍 [LAYER 3 - AI Service] No AI providers configured, using fallback responses');
        return this.generateFallbackAdvice(question, analysis, rules);
      }

      // Only use Groq AI - validate it's available
      if (!this.groq) {
        console.error('❌ Groq AI is not initialized');
        return this.generateFallbackAdvice(question, analysis, rules);
      }

      console.log('🎯 Using Groq AI for financial advice...');

      try {
        console.log('🔄 Calling generateGroqAdvice...');
        const result = await this.generateGroqAdvice(question, analysis, rules, context);
        console.log('✅ Groq API call completed successfully');
        console.log('📝 Response preview:', result.response.substring(0, 100));
        return result;
      } catch (groqError) {
        console.error('❌ Groq API failed with error:', groqError.message);
        console.log('🔄 Switching to intelligent fallback for question:', question);
        const fallbackResult = this.generateFallbackAdvice(question, analysis, rules);
        console.log('✅ Fallback response generated');
        return fallbackResult;
      }
    } catch (err) {
      console.error('❌ [LAYER 3 - AI Service] AI Generation Error:', err);
      console.error('❌ [LAYER 3 - AI Service] Error stack:', err.stack);

      // Add layer information to error
      err.layer = 'AI Service';
      throw err;
    }
  }

  /**
   * Generate financial advice using Groq AI
   */
  async generateGroqAdvice(question, analysis, rules, context = {}) {
    console.log('🤖 Generating Groq AI advice for question:', question);

    try {
      // Prepare the prompt with financial context
      const prompt = this.buildGroqPrompt(question, analysis, rules, context);

      console.log('📝 Groq prompt prepared, length:', prompt.length);

      // Call Groq API
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial advisor providing personalized advice based on user spending data. Be helpful, accurate, and conservative with financial recommendations. Always consider risk tolerance and provide balanced advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'mixtral-8x7b-32768', // Groq's fast model
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response from Groq API');
      }

      console.log('✅ Groq response received, length:', response.length);

      return {
        response: response,
        model: 'groq-mixtral',
        confidence: 0.85,
        metadata: {
          provider: 'groq',
          model: 'mixtral-8x7b-32768',
          tokens: completion.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('❌ Groq API error:', error.message);
      throw error;
    }
  }

  /**
   * Build comprehensive prompt for Groq AI
   */
  buildGroqPrompt(question, analysis, rules, context) {
    const {
      totalSpent = 0,
      categoryBreakdown = {},
      averages = {},
      userProfile = {}
    } = analysis;

    const { summary = {} } = rules;

    // Build financial context
    const financialContext = `
USER FINANCIAL PROFILE:
- Monthly Income: ₹${userProfile.income || 'Not specified'}
- Monthly Expenses: ₹${averages.monthly || totalSpent || 0}
- Financial Health Score: ${summary.overallHealthScore || 70}/100
- Top Spending Categories: ${Object.entries(categoryBreakdown)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([cat, amt]) => `${cat} (₹${amt})`)
  .join(', ')}

FINANCIAL RULES & INSIGHTS:
${rules.insights?.map(insight => `- ${insight}`).join('\n') || 'No specific insights available'}

RECOMMENDATIONS FROM ANALYSIS:
${rules.recommendations?.map(rec => `- ${rec.description} (${rec.priority} priority)`).join('\n') || 'No recommendations available'}
    `.trim();

    // Build the complete prompt
    const prompt = `
Based on the following financial data and analysis, please provide personalized financial advice for this question:

${financialContext}

USER QUESTION: "${question}"

Please provide:
1. Direct answer to the question
2. Specific recommendations based on their spending patterns
3. Risk considerations if applicable
4. Actionable next steps

Keep the response helpful, professional, and tailored to their financial situation. Use Indian Rupees (₹) for currency references.
    `.trim();

    return prompt;
  }

  generateFallbackAdvice(question, analysis, rules) {
    console.log('🚨 🚨 🚨 FALLBACK METHOD CALLED WITH QUESTION:', question);
    console.log('🚨 🚨 🚨 USING SEMANTIC ANALYSIS 🚨 🚨 🚨');

    // Use semantic analysis for intelligent responses
    try {
      const semanticContext = performSemanticAnalysis(question);
      return generateSemanticResponse(semanticContext, analysis, rules);
    } catch (semanticError) {
      console.error('❌ Semantic analysis failed:', semanticError.message);
      // Fallback to basic keyword-based response if semantic analysis fails
      return this.generateKeywordFallback(question, analysis, rules);
    }

    // Analyze the question to provide relevant advice
    const questionLower = question.toLowerCase();

    let response = '';

    // Handle specific investment questions
    if (questionLower.includes('invest') || questionLower.includes('investment')) {
      if (questionLower.includes('fd') || questionLower.includes('fixed deposit')) {
        response = `**Fixed Deposits (FDs) vs Mutual Funds Analysis:**

**Fixed Deposits (FDs):**
✅ **Pros:** Guaranteed returns, low risk, easy to understand
✅ **Returns:** 5-7% annual interest (taxed)
✅ **Safety:** Government insured up to ₹5 lakh
✅ **Liquidity:** Can break early (penalty applies)

**Mutual Funds:**
✅ **Pros:** Higher potential returns (8-15% historically), diversification
✅ **Tax Benefits:** ELSS funds offer tax deductions
✅ **Flexibility:** SIP investments, easy withdrawals
❌ **Risk:** Market volatility, no guaranteed returns

**For ₹1000/month investment:**
- **FDs:** Safe but lower returns (₹60-84/year)
- **Mutual Funds:** Higher growth potential but with market risk

**Recommendation:** Start with mutual funds for long-term growth, keep FDs for emergency funds.`;
      } else if (questionLower.includes('mutual fund')) {
        response = `**Mutual Funds Investment Strategy:**

For ₹1000/month investment, I recommend:

**Best Options:**
1. **Index Funds/SIP** - Low cost, tracks market
2. **ELSS Funds** - Tax saving + growth
3. **Balanced Funds** - Moderate risk

**Why Mutual Funds over FDs:**
- **Higher Returns:** 12-15% vs 6-7% from FDs
- **Tax Efficiency:** Long-term capital gains tax benefits
- **Inflation Protection:** Better than FD fixed rates

**Action Plan:**
- Open demat account
- Start SIP in diversified funds
- Monitor quarterly, don't panic during market dips`;
      }
    }
    // Handle savings questions
    else if (questionLower.includes('save') || questionLower.includes('saving')) {
      response = `**Saving Strategies for ₹1000/month:**

**Immediate Actions:**
1. **Track Expenses:** Use budgeting app to find ₹1000 in waste
2. **Cut Subscriptions:** Cancel unused services
3. **Meal Planning:** Cook at home instead of eating out

**Investment Approach:**
- **50%** (₹500) → Emergency Fund/High-yield savings
- **30%** (₹300) → Mutual Funds SIP
- **20%** (₹200) → Skill development/learning

**Long-term:** Automate transfers, set up alerts for overspending`;
    }
    // Default financial advice
    else {
      response = `**Personalized Financial Advice:**

Based on your spending pattern, here are key recommendations:

**Budget Optimization:**
- Focus on reducing ${Object.entries(analysis.categoryBreakdown).sort((a,b)=>b[1]-a[1])[0][0]} category spending
- Aim for 50/30/20 rule: 50% needs, 30% wants, 20% savings/investments

**For ₹1000 monthly surplus:**
- Build emergency fund (6 months expenses)
- Start systematic investment plan (SIP)
- Consider life/health insurance

**Next Steps:**
1. Create detailed monthly budget
2. Set specific financial goals
3. Consult financial advisor for personalized plan`;
    }

    return {
      response,
      model: 'intelligent-fallback',
      confidence: 0.7,
      metadata: {
        questionAnalyzed: true,
        personalizedAdvice: true,
        actionableSteps: true
      }
    };
  }

  generateFallbackAdvice(question, analysis, rules) {
    console.log('🚨 SEMANTIC FALLBACK METHOD CALLED!');
    console.log('🚨 Question:', question);

    // Perform semantic analysis
    const semanticContext = performSemanticAnalysis(question);

    console.log('🔍 Semantic Analysis in Fallback:', {
      type: semanticContext.questionType,
      intent: semanticContext.intent,
      topics: semanticContext.topics,
      concepts: semanticContext.concepts,
      confidence: semanticContext.confidence
    });

    // Generate response based on semantic understanding
    const semanticResult = this.generateSemanticResponse(semanticContext, analysis, rules);

    return {
      response: semanticResult.response,
      model: semanticResult.model,
      confidence: semanticResult.confidence
    };
  }

  // Generate response based on semantic analysis
  generateSemanticResponse(context, analysis, rules) {
    const { questionType, intent, topics, concepts, originalQuestion } = context;

    console.log('🤖 Generating semantic response for:', { questionType, intent, topics, concepts });

    // Educational questions
    if (questionType === 'educational') {
      return this.generateEducationalResponse(topics, concepts, originalQuestion);
    }

    // Comparative questions
    if (questionType === 'comparative') {
      return this.generateComparativeResponse(topics, concepts, originalQuestion);
    }

    // Advisory questions
    if (questionType === 'advisory') {
      return this.generateAdvisoryResponse(intent, topics, concepts, analysis, rules);
    }

    // Planning questions
    if (questionType === 'planning') {
      return this.generatePlanningResponse(topics, concepts, analysis, rules);
    }

    // Default general response
    return this.generateGeneralResponse(intent, topics, concepts, analysis, rules);
  }

  // Generate educational responses
  generateEducationalResponse(topics, concepts, question) {
    // Handle specific concepts
    if (concepts.includes('mutual_fund')) {
      return {
        response: `**What is a Mutual Fund?**

A mutual fund is a professionally managed investment vehicle that pools money from multiple investors to invest in a diversified portfolio of stocks, bonds, or other securities.

**Key Features:**
✅ **Diversification:** Spreads risk across multiple investments
✅ **Professional Management:** Expert fund managers make decisions
✅ **Liquidity:** Can buy/sell units anytime (open-ended funds)
✅ **SIP Option:** Systematic Investment Plan for regular investing

**Types:** Index funds, ELSS (tax-saving), Balanced funds, Debt funds

**Benefits:** Lower risk than individual stocks, expert management, easy access`,
        model: 'semantic-educational',
        confidence: 0.9
      };
    }

    if (concepts.includes('fixed_deposit')) {
      return {
        response: `**What is a Fixed Deposit (FD)?**

A Fixed Deposit is a savings instrument where you deposit money for a fixed period at a predetermined interest rate.

**Key Features:**
✅ **Guaranteed Returns:** Fixed interest rate
✅ **Safety:** Government insured up to ₹5 lakh
✅ **Flexible Tenure:** 7 days to 10 years
✅ **Auto-Renewal:** Option to reinvest automatically

**Interest Rates:** 5-7% annually (taxable)
**Best For:** Risk-averse investors, parking emergency funds

**Comparison:** Safer than stocks but lower returns than equity investments`,
        model: 'semantic-educational',
        confidence: 0.9
      };
    }

    if (concepts.includes('compound_interest')) {
      return {
        response: `**What is Compound Interest?**

Compound interest is the interest earned on both the initial principal and the accumulated interest from previous periods.

**Example:** ₹10,000 at 10% interest
- **Year 1:** ₹10,000 × 10% = ₹1,000 → Total: ₹11,000
- **Year 2:** ₹11,000 × 10% = ₹1,100 → Total: ₹12,100
- **Year 3:** ₹12,100 × 10% = ₹1,210 → Total: ₹13,310

**Power of Compounding:**
- **Early Starting:** More time for money to grow
- **Regular Contributions:** SIP utilizes compounding
- **Higher Returns:** Interest on interest creates exponential growth

**Key:** Start early, stay invested, reinvest returns!`,
        model: 'semantic-educational',
        confidence: 0.9
      };
    }

    if (concepts.includes('emergency_fund')) {
      return {
        response: `**What is an Emergency Fund?**

An emergency fund is a dedicated savings account for unexpected financial needs like medical emergencies, job loss, or urgent repairs.

**Key Principles:**
✅ **3-6 Months Expenses:** Aim for 3-6 months of living expenses
✅ **Liquid & Accessible:** Easy withdrawal without penalties
✅ **Separate Account:** Keep separate from regular savings
✅ **High-Interest Account:** Earn some interest while keeping safe

**Why Important:**
- **Financial Security:** Protects against life's uncertainties
- **Prevents Debt:** Avoid high-interest loans for emergencies
- **Peace of Mind:** Reduces stress during tough times

**Building Strategy:** Save 10-20% of income monthly until target reached`,
        model: 'semantic-educational',
        confidence: 0.9
      };
    }

    // General educational response
    return {
      response: `**Financial Education Response**

Based on your question about "${question}", here's some educational information:

**Key Financial Concepts:**
• **Compound Interest:** Interest on interest - start early!
• **Diversification:** Don't put all eggs in one basket
• **Risk-Return Tradeoff:** Higher returns usually mean higher risk
• **Time Value of Money:** Money today is worth more than tomorrow

**Recommended Learning:**
1. Basic budgeting principles
2. Understanding investment options
3. Risk assessment and management
4. Tax planning basics

Would you like me to explain any specific financial concept in detail?`,
      model: 'semantic-educational',
      confidence: 0.7
    };
  }

  // Generate comparative responses
  generateComparativeResponse(topics, concepts, question) {
    // Investment comparisons
    if (topics.includes('investment') && concepts.includes('fixed_deposit') && concepts.includes('mutual_fund')) {
      return {
        response: `**Fixed Deposits vs Mutual Funds: Complete Comparison**

**🔒 Safety & Risk:**
- **FDs:** 100% safe, government insured, zero risk of capital loss
- **Mutual Funds:** Market risk, can lose value, but diversification reduces risk

**💰 Returns:**
- **FDs:** 5-7% guaranteed annual returns (taxable)
- **Mutual Funds:** 10-15% potential CAGR, varies with market performance

**⏰ Lock-in Period:**
- **FDs:** 7 days to 10 years (early withdrawal penalties apply)
- **Mutual Funds:** Most are open-ended (withdraw anytime), some have exit loads

**💵 Liquidity:**
- **FDs:** Partial withdrawals possible, penalty for early closure
- **Mutual Funds:** High liquidity, can sell units anytime

**📊 Taxation:**
- **FDs:** Interest taxed at slab rate
- **Mutual Funds:** LTCG tax benefits for long-term holding

**🎯 Best For:**
- **FDs:** Conservative investors, emergency funds, short-term goals
- **Mutual Funds:** Long-term wealth creation, higher growth potential

**💡 Recommendation:** 70% Mutual Funds + 30% FDs for balanced approach`,
        model: 'semantic-comparative',
        confidence: 0.95
      };
    }

    // General comparative response
    return {
      response: `**Comparative Analysis**

For comparing financial options, consider these key factors:

**Risk vs Return:**
• Higher returns usually come with higher risk
• Conservative options prioritize safety over growth
• Aggressive options focus on maximum growth potential

**Time Horizon:**
• Short-term (1-3 years): Focus on safety and liquidity
• Medium-term (3-7 years): Balance risk and return
• Long-term (7+ years): Can afford more risk for higher returns

**Your Situation:**
• Available capital, risk tolerance, and investment goals matter
• Consider inflation impact and tax implications
• Diversification is key to managing risk

**General Advice:** Choose based on your risk appetite and time horizon. Conservative options for safety, aggressive options for growth.`,
      model: 'semantic-comparative',
      confidence: 0.8
    };
  }

  // Generate advisory responses
  generateAdvisoryResponse(intent, topics, concepts, analysis, rules) {
    // Investment advice
    if (topics.includes('investment')) {
      const monthlyIncome = analysis.userProfile?.income ? analysis.userProfile.income / 12 : 0;
      const monthlyExpenses = analysis.averages?.monthly || 0;
      const surplus = monthlyIncome - monthlyExpenses;

      return `**Personalized Investment Advice**

Based on your financial profile, here's my recommendation:

**Your Financial Snapshot:**
- Monthly Income: ₹${monthlyIncome.toFixed(0)}
- Monthly Expenses: ₹${monthlyExpenses.toFixed(0)}
- Monthly Surplus: ₹${surplus.toFixed(0)}

**Recommended Allocation:**
• **60% High Growth:** Diversified mutual funds/SIP
• **30% Moderate Risk:** Balanced advantage funds
• **10% Safe Haven:** Fixed deposits/liquid funds

**Action Plan:**
1. **Start SIP:** ₹${Math.max(1000, Math.floor(surplus * 0.6))} monthly in index funds
2. **Emergency Fund:** 6 months expenses in liquid savings
3. **Tax Planning:** Utilize ELSS for tax benefits
4. **Monitor Quarterly:** Review and rebalance portfolio

**Risk Considerations:**
- Your risk tolerance appears ${rules.summary?.overallHealthScore > 70 ? 'moderate' : 'conservative'}
- Market volatility is normal - stay invested for long term
- Consider professional advice for large amounts

**Next Steps:** Start small, stay consistent, focus on long-term wealth creation!`;
    }

    // Savings advice
    if (topics.includes('savings')) {
      return `**Personalized Savings Strategy**

**Current Analysis:**
- You spend ₹${analysis.totalSpent || 0} monthly
- Top expense category: ${Object.entries(analysis.categoryBreakdown || {}).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'unknown'}

**Saving Recommendations:**
1. **Track Expenses:** Use apps to monitor spending patterns
2. **Cut Non-Essentials:** Find ₹${Math.floor((analysis.totalSpent || 0) * 0.2)} monthly savings
3. **Meal Planning:** Cook at home to save on food expenses
4. **Smart Shopping:** Use coupons and comparison shopping

**Emergency Fund Goal:** 6 months expenses = ₹${((analysis.averages?.monthly || 0) * 6).toFixed(0)}

**Action Items:**
• Set up automatic transfers to savings account
• Create separate emergency fund account
• Review subscriptions and cancel unused ones
• Set savings goals and track progress

**Remember:** Small consistent savings build wealth over time!`;
    }

    // General advisory response
    return `**Financial Advisory Response**

Based on your question and financial data, here's my advice:

**Key Considerations:**
• Your financial health score: ${rules.summary?.overallHealthScore || 70}/100
• Risk tolerance assessment needed for personalized advice
• Consider your investment timeline and goals

**General Recommendations:**
1. **Emergency Fund:** 3-6 months expenses as safety net
2. **Debt Management:** Pay high-interest debt first
3. **Goal Setting:** Define clear financial objectives
4. **Consistent Saving:** Automate regular contributions
5. **Long-term Investing:** Utilize power of compounding

**Next Steps:**
• Assess your risk tolerance
• Create a detailed financial plan
• Start with small, consistent steps
• Consider professional financial advice

Would you like me to elaborate on any specific aspect?`;
  }

  // Generate planning responses
  generatePlanningResponse(topics, concepts, analysis, rules) {
    if (topics.includes('planning')) {
      return `**Financial Planning Guidance**

**Long-term Planning Considerations:**

**1. Goal Setting:**
• Define specific, measurable financial goals
• Set realistic timelines for achievement
• Break large goals into smaller milestones

**2. Risk Assessment:**
• Your current risk profile: ${rules.summary?.overallHealthScore > 70 ? 'Can afford moderate risk' : 'Conservative approach recommended'}
• Consider life changes and market conditions

**3. Strategy Development:**
• **Conservative:** Focus on capital preservation
• **Moderate:** Balance growth and safety
• **Aggressive:** Maximize long-term growth potential

**4. Regular Review:**
• Monitor progress quarterly
• Adjust strategy as goals change
• Rebalance portfolio annually

**5. Professional Help:**
• Consider certified financial planner for complex situations
• Tax advisor for optimization strategies
• Legal counsel for estate planning

**Remember:** Financial planning is a journey, not a destination. Start now and stay consistent!`;
    }

    return `**Planning and Goal Setting**

**Strategic Financial Planning:**

**Define Your Goals:**
• Short-term (1-3 years): Emergency fund, debt reduction
• Medium-term (3-7 years): Major purchases, education
• Long-term (7+ years): Retirement, wealth building

**Assessment Factors:**
• Current age and life stage
• Income stability and growth potential
• Existing assets and liabilities
• Risk tolerance and investment horizon

**Implementation Steps:**
1. **Calculate Needs:** Determine required amounts for each goal
2. **Timeline Planning:** Set realistic achievement dates
3. **Strategy Selection:** Choose appropriate investment vehicles
4. **Regular Monitoring:** Track progress and adjust as needed

**Key Principles:**
• Start early for compound growth benefits
• Diversify to manage risk
• Stay disciplined during market fluctuations
• Seek professional advice for complex planning

**Your Next Step:** Define 2-3 specific financial goals with timelines!`;
  }

  // Generate general responses
  generateGeneralResponse(intent, topics, concepts, analysis, rules) {
    return {
      response: `**General Financial Guidance**

Based on your question, here's some comprehensive financial advice:

**Current Financial Health:**
• Overall Score: ${rules.summary?.overallHealthScore || 70}/100
• Monthly Spending: ₹${analysis.totalSpent || 0}
• Key Focus Areas: ${topics.join(', ') || 'budget optimization'}

**Core Financial Principles:**
1. **Live Below Means:** Spend less than you earn
2. **Emergency Fund:** 3-6 months expenses as safety net
3. **Debt Management:** Pay high-interest debt first
4. **Consistent Saving:** Automate regular contributions
5. **Long-term Investing:** Utilize power of compounding

**Recommended Actions:**
• Track all expenses for one month
• Create a realistic budget
• Set specific financial goals
• Start small investment habit
• Review progress regularly

**Personalized Tips:**
• Focus on ${topics.includes('savings') ? 'building savings habits' : topics.includes('investment') ? 'learning investment basics' : 'understanding your cash flow'}

**Remember:** Financial wellness is a journey. Small, consistent steps lead to big results!

Would you like me to elaborate on any specific financial topic?`,
      model: 'semantic-general',
      confidence: 0.7
    };
  }

  analyzeQueryComplexity(question) {
      return {
        response: `**Fixed Deposits vs Mutual Funds: Complete Comparison**

**🔒 Safety & Risk:**
- **FDs:** 100% safe, government insured, zero risk of capital loss
- **Mutual Funds:** Market risk, can lose value, but diversification reduces risk

**💰 Returns:**
- **FDs:** 5-7% guaranteed annual returns (taxable)
- **Mutual Funds:** 10-15% potential CAGR, varies with market performance

**⏰ Lock-in Period:**
- **FDs:** 7 days to 10 years (early withdrawal penalties apply)
- **Mutual Funds:** Most are open-ended (withdraw anytime), some have exit loads

**💵 Liquidity:**
- **FDs:** Partial withdrawals possible, penalty for early closure
- **Mutual Funds:** High liquidity, can sell units anytime

**📊 Taxation:**
- **FDs:** Interest taxed at slab rate
- **Mutual Funds:** LTCG tax benefits for long-term holding

**🎯 Best For:**
- **FDs:** Conservative investors, emergency funds, short-term goals
- **Mutual Funds:** Long-term wealth creation, higher growth potential

**💡 Recommendation:** 70% Mutual Funds + 30% FDs for balanced approach`,
        model: 'intelligent-fallback',
        confidence: 0.85
      };
    }

    analyzeQueryComplexity(question) {
      // Analyze query complexity for routing decisions
      const complexity = {
        length: question.length,
        hasNumbers: /\d/.test(question),
        hasComparisons: /\b(vs|versus|compare|better|worse|difference)\b/i.test(question),
        hasTechnicalTerms: /\b(market|portfolio|diversification|compound|interest|mutual|fund|stock|bond|fd|sip)\b/i.test(question),
        estimatedComplexity: 'medium'
      };

      // Determine complexity level
      if (complexity.length > 200 || complexity.hasComparisons || complexity.hasTechnicalTerms) {
        complexity.estimatedComplexity = 'high';
      } else if (complexity.length < 50 && !complexity.hasTechnicalTerms) {
        complexity.estimatedComplexity = 'low';
      }

      return complexity;
    }

    // Generate response based on semantic analysis
    generateSemanticResponse(context, analysis, rules) {
      const { questionType, intent, topics, concepts, originalQuestion } = context;

      console.log('🤖 Generating semantic response for:', { questionType, intent, topics, concepts });

      // Educational questions
      if (questionType === 'educational') {
        return this.generateEducationalResponse(topics, concepts, originalQuestion);
      }

      // Comparative questions
      if (questionType === 'comparative') {
        return this.generateComparativeResponse(topics, concepts, originalQuestion);
      }

      // Advisory questions
      if (questionType === 'advisory') {
        return this.generateAdvisoryResponse(intent, topics, concepts, analysis, rules);
      }

      // Planning questions
      if (questionType === 'planning') {
        return this.generatePlanningResponse(topics, concepts, analysis, rules);
      }

      // Default general response
      return this.generateGeneralResponse(intent, topics, concepts, analysis, rules);
    }

    // Generate educational responses
    generateEducationalResponse(topics, concepts, question) {
      // Handle specific concepts
      if (concepts.includes('mutual_fund')) {
        return {
          response: `**What is a Mutual Fund?**

A mutual fund is a professionally managed investment vehicle that pools money from multiple investors to invest in a diversified portfolio of stocks, bonds, or other securities.

**Key Features:**
✅ **Diversification:** Spreads risk across multiple investments
✅ **Professional Management:** Expert fund managers make decisions
✅ **Liquidity:** Can buy/sell units anytime (open-ended funds)
✅ **SIP Option:** Systematic Investment Plan for regular investing

**Types:** Index funds, ELSS (tax-saving), Balanced funds, Debt funds

**Benefits:** Lower risk than individual stocks, expert management, easy access`,
          model: 'semantic-educational',
          confidence: 0.9
        };
      }

      if (concepts.includes('fixed_deposit')) {
        return {
          response: `**What is a Fixed Deposit (FD)?**

A Fixed Deposit is a savings instrument where you deposit money for a fixed period at a predetermined interest rate.

**Key Features:**
✅ **Guaranteed Returns:** Fixed interest rate
✅ **Safety:** Government insured up to ₹5 lakh
✅ **Flexible Tenure:** 7 days to 10 years
✅ **Auto-Renewal:** Option to reinvest automatically

**Interest Rates:** 5-7% annually (taxable)
**Best For:** Risk-averse investors, parking emergency funds

**Comparison:** Safer than stocks but lower returns than equity investments`,
          model: 'semantic-educational',
          confidence: 0.9
        };
      }

      if (concepts.includes('compound_interest')) {
        return {
          response: `**What is Compound Interest?**

Compound interest is the interest earned on both the initial principal and the accumulated interest from previous periods.

**Example:** ₹10,000 at 10% interest
- **Year 1:** ₹10,000 × 10% = ₹1,000 → Total: ₹11,000
- **Year 2:** ₹11,000 × 10% = ₹1,100 → Total: ₹12,100
- **Year 3:** ₹12,100 × 10% = ₹1,210 → Total: ₹13,310

**Power of Compounding:**
- **Early Starting:** More time for money to grow
- **Regular Contributions:** SIP utilizes compounding
- **Higher Returns:** Interest on interest creates exponential growth

**Key:** Start early, stay invested, reinvest returns!`,
          model: 'semantic-educational',
          confidence: 0.9
        };
      }

      // Default educational response
      return {
        response: `**Financial Education Response**

Based on your question about "${question}", here's some educational information:

**Key Financial Concepts:**
• **Compound Interest:** Interest on interest - start early!
• **Diversification:** Don't put all eggs in one basket
• **Risk-Return Tradeoff:** Higher returns usually mean higher risk
• **Time Value of Money:** Money today is worth more than tomorrow

**Recommended Learning:**
1. Basic budgeting principles
2. Understanding investment options
3. Risk assessment and management
4. Tax planning basics

Would you like me to explain any specific financial concept in detail?`,
        model: 'semantic-educational',
        confidence: 0.7
      };
    }

    // Generate comparative responses
    generateComparativeResponse(topics, concepts, question) {
      if (concepts.includes('mutual_fund') && concepts.includes('fixed_deposit')) {
        return {
          response: `**Mutual Funds vs Fixed Deposits (FDs) - Complete Comparison:**

**🔒 Safety & Risk:**
- **FDs:** Very safe, capital guaranteed, government insured. Almost zero risk.
- **Mutual Funds:** Subject to market risks. Value can fluctuate, and you can lose money.

**💰 Returns:**
- **FDs:** Fixed, predictable returns (e.g., 5-7% annually).
- **Mutual Funds:** Market-linked returns, potential for higher growth (e.g., 10-15% historically), but not guaranteed.

**⏰ Liquidity:**
- **FDs:** Can be broken prematurely with a penalty.
- **Mutual Funds:** Generally liquid (especially open-ended funds), can be redeemed anytime, though some may have exit loads.

**📊 Taxation:**
- **FDs:** Interest income is added to your total income and taxed as per your income tax slab.
- **Mutual Funds:** Long-term capital gains (LTCG) and short-term capital gains (STCG) have specific tax rules, often more tax-efficient for long-term investments.

**🎯 Best For:**
- **FDs:** Conservative investors, building an emergency fund, short-term goals where capital preservation is key.
- **Mutual Funds:** Investors seeking long-term wealth creation, willing to take moderate to high risk, and aiming to beat inflation.

**Recommendation:** For your ₹1000/month extra, consider a balanced approach. Allocate a portion to FDs for safety and another to mutual funds (e.g., through SIPs) for growth.`,
          model: 'semantic-comparative',
          confidence: 0.95
        };
      }

      // Default comparative response
      return {
        response: `**Comparing Financial Options**

You asked to compare aspects of "${question}". Here's a general comparison framework:

**Key Comparison Points:**
1. **Risk vs. Return:** Higher potential returns usually come with higher risk.
2. **Liquidity:** How easily can you access your money?
3. **Taxation:** How are the gains/income taxed?
4. **Time Horizon:** Short-term vs. long-term suitability.
5. **Goals:** Which option best aligns with your financial objectives?

Could you specify which two financial products or strategies you'd like me to compare?`,
        model: 'semantic-comparative',
        confidence: 0.8
      };
    }

    // Generate advisory responses
    generateAdvisoryResponse(intent, topics, concepts, analysis, rules) {
      const { userProfile, totalSpent, timeframes, averages, categoryBreakdown } = analysis;
      const { summary } = rules;

      // Prioritize investment advice if relevant
      if (topics.includes('investment') || intent.includes('growth')) {
        return {
          response: `**Personalized Investment Advice**

Based on your interest in investments and your financial profile:

**Current Snapshot:**
- Monthly Spending: ₹${analysis.totalSpent || 0}
- Financial Health Score: ${summary?.overallHealthScore || 70}/100

**Investment Recommendations:**
1. **Start with SIPs:** Invest a fixed amount regularly in mutual funds.
2. **Diversify:** Don't put all your money in one place (e.g., mix stocks, bonds, FDs).
3. **Understand Risk:** Align investments with your risk tolerance.
4. **Long-Term View:** Investing is a marathon, not a sprint.
5. **Review Goals:** Ensure investments align with your financial goals (e.g., retirement, house).

**For your ₹1000/month extra:**
- Consider starting a SIP in a diversified equity mutual fund for long-term growth.
- Alternatively, if you're risk-averse, a recurring deposit or a balanced fund could be suitable.

**Next Steps:**
• Research different types of mutual funds (e.g., index funds, large-cap funds).
• Consult a financial advisor to create a personalized investment plan.`,
          model: 'semantic-advisory',
          confidence: 0.85
        };
      }

      // Default advisory response
      return {
        response: `**Financial Advisory Response**

Based on your question and financial data, here's my advice:

**Key Considerations:**
• Overall Health Score: ${summary?.overallHealthScore || 70}/100
• Monthly Spending: ₹${totalSpent || 0}
• Your primary intent: ${intent.join(', ') || 'general guidance'}

**General Recommendations:**
1. **Build Emergency Fund:** Aim for 3-6 months of living expenses.
2. **Reduce High-Interest Debt:** Prioritize credit cards and personal loans.
3. **Increase Savings Rate:** Automate savings to reach your goals faster.
4. **Invest Wisely:** Diversify your portfolio according to your risk tolerance.
5. **Review Regularly:** Monitor your finances and adjust your plan as needed.

Could you please provide more specific details about what aspect of personal finance you'd like advice on?`,
        model: 'semantic-advisory',
        confidence: 0.75
      };
    }

    // Generate planning responses
    generatePlanningResponse(topics, concepts, analysis, rules) {
      const { userProfile } = analysis;
      if (topics.includes('planning')) {
        return {
          response: `**Financial Planning Guidance**

You're interested in financial planning, which is a great step!

**Key Principles:**
1. **Define Goals:** What are you saving for (e.g., house, education, retirement)?
2. **Create a Budget:** Understand your cash flow to allocate funds.
3. **Build a Safety Net:** Establish an emergency fund.
4. **Invest Strategically:** Choose investments aligned with your goals and timeline.
5. **Monitor & Adjust:** Regularly review your plan and make necessary changes.

**Your Next Step:** Define 2-3 specific financial goals with timelines!`,
          model: 'semantic-planning',
          confidence: 0.8
        };
      }

      return {
        response: `**Planning and Goal Setting**

**Strategic Financial Planning:**

**Define Your Goals:**
• Short-term (1-3 years): Emergency fund, debt reduction
• Medium-term (3-7 years): Major purchases, education
• Long-term (7+ years): Retirement, wealth building

**Assessment Factors:**
• Current age and life stage
• Income stability and growth potential
• Existing assets and liabilities
• Risk tolerance and investment horizon

**Implementation Steps:**
1. Set specific, measurable goals
2. Create a realistic timeline
3. Calculate required savings/investments
4. Choose appropriate investment vehicles
5. Monitor progress and adjust as needed

**Remember:** Financial planning is a journey, not a destination. Start now and stay consistent!`,
        model: 'semantic-planning',
        confidence: 0.75
      };
    }

    // Generate general responses
    generateGeneralResponse(intent, topics, concepts, analysis, rules) {
      const { userProfile, totalSpent, timeframes, averages, categoryBreakdown } = analysis;
      const { summary } = rules;
      return {
        response: `**General Financial Guidance**

Based on your question, here's some comprehensive financial advice:

**Current Financial Health:**
• Overall Score: ${summary?.overallHealthScore || 70}/100
• Monthly Spending: ₹${totalSpent || 0}
• Key Focus Areas: ${topics.join(', ') || 'budget optimization'}

**Core Financial Principles:**
1. **Live Below Means:** Spend less than you earn
2. **Emergency Fund:** 3-6 months expenses as safety net
3. **Debt Management:** Pay high-interest debt first
4. **Consistent Saving:** Automate regular contributions
5. **Long-term Investing:** Utilize power of compounding

**Recommended Actions:**
• Track all expenses for one month
• Create a realistic budget
• Set specific financial goals
• Start small investment habit
• Review progress regularly

**Personalized Tips:**
• Focus on ${topics.includes('savings') ? 'building savings habits' : topics.includes('investment') ? 'learning investment basics' : 'understanding your cash flow'}

**Remember:** Financial wellness is a journey. Small, consistent steps lead to big results!

Would you like me to elaborate on any specific financial topic?`,
        model: 'semantic-general',
        confidence: 0.7
      };
    }

    // Fallback method for when semantic analysis fails
    generateKeywordFallback(question, analysis, rules) {
      return {
        response: `**Financial Guidance**

I understand you're asking about financial matters. Based on your spending data:

**Current Overview:**
- Monthly spending: ₹${analysis.totalSpent || 0}
- Financial health score: ${rules.summary?.overallHealthScore || 70}/100

**General Advice:**
1. Build an emergency fund (3-6 months expenses)
2. Reduce high-interest debt
3. Increase savings rate
4. Consider diversified investments

For more specific advice about "${question}", could you provide additional details about your financial situation or goals?`,
        model: 'keyword-fallback',
        confidence: 0.5
      };
    }
  }
let instance = null;

function getAdvancedAIService() {
  if (!instance) {
    instance = new AdvancedAIService();
  }
  return instance;
}

module.exports = { AdvancedAIService, getAdvancedAIService };
