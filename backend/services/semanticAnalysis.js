// Semantic Analysis Service for Financial Questions

/**
 * Perform comprehensive semantic analysis on financial questions
 * @param {string} question - The user's question
 * @returns {object} Analysis context with type, intent, topics, concepts, and confidence
 */
function performSemanticAnalysis(question) {
  const questionLower = question.toLowerCase();

  // 1. QUESTION TYPE CLASSIFICATION
  const questionType = classifyQuestionType(questionLower);

  // 2. INTENT ANALYSIS
  const intent = analyzeQuestionIntent(questionLower);

  // 3. TOPIC EXTRACTION (Semantic, not keyword-based)
  const topics = extractTopicsSemantically(questionLower);

  // 4. FINANCIAL CONCEPT RECOGNITION
  const concepts = recognizeFinancialConcepts(questionLower);

  // 5. CONTEXT BUILDING
  const context = {
    questionType,
    intent,
    topics,
    concepts,
    originalQuestion: question,
    confidence: calculateConfidenceScore(topics, concepts)
  };

  console.log('🔍 Semantic Analysis Results:', {
    type: questionType,
    intent,
    topics,
    concepts,
    confidence: context.confidence
  });

  return context;
}

/**
 * Classify question type based on linguistic patterns
 * @param {string} question - Lowercase question
 * @returns {string} Question type
 */
function classifyQuestionType(question) {
  // Educational questions
  if (/\b(what is|explain|how does|tell me about|describe|define)\b/.test(question)) {
    return 'educational';
  }

  // Comparative questions
  if (/(differ|diffrence|vs|versus|compare|better|worse|comparison|which is)/.test(question)) {
    return 'comparative';
  }

  // Advisory questions
  if (/\b(should I|recommend|advice|suggest|best way|how to|what should)\b/.test(question)) {
    return 'advisory';
  }

  // Calculative questions
  if (/\b(calculate|how much|returns|profit|loss|percentage)\b/.test(question)) {
    return 'calculative';
  }

  // Planning questions
  if (/\b(future|plan|goal|retirement|tax|insurance|long.term|short.term)\b/.test(question)) {
    return 'planning';
  }

  return 'general';
}

/**
 * Analyze the underlying intent of the question
 * @param {string} question - Lowercase question
 * @returns {array} Array of intents
 */
function analyzeQuestionIntent(question) {
  const intents = [];

  // Growth/Investment intent
  if (/\b(grow|increase|multiply|build wealth|make money|earn more|returns)\b/.test(question)) {
    intents.push('growth');
  }

  // Safety/Preservation intent
  if (/\b(safe|secure|protect|risk.free|guaranteed|stable)\b/.test(question)) {
    intents.push('preservation');
  }

  // Risk management intent
  if (/\b(risk|volatility|market crash|loss|protect|hedge)\b/.test(question)) {
    intents.push('risk_management');
  }

  // Education intent
  if (/\b(learn|understand|explain|what is|how does)\b/.test(question)) {
    intents.push('education');
  }

  // Comparison intent
  if (/\b(better|worse|vs|versus|difference|compare)\b/.test(question)) {
    intents.push('comparison');
  }

  return intents.length > 0 ? intents : ['general'];
}

/**
 * Semantic topic extraction (understands context, not just keywords)
 * @param {string} question - Lowercase question
 * @returns {array} Array of topics
 */
function extractTopicsSemantically(question) {
  const topics = [];

  // Investment topics (semantic recognition)
  if (/\b(grow|increase|multiply|compound|returns?|profit|capital|portfolio)\b/.test(question) ||
      /\b(stock|equity|bond|mutual.fund|sip|trading|market|investment|wealth)\b/.test(question)) {
    topics.push('investment');
  }

  // Savings topics (semantic recognition)
  if (/\b(save|saving|emergency.fund|budget|expense|cut.cost|reduce|frugal)\b/.test(question) ||
      /\b(bank.account|savings.account|deposit|cash|money.stored)\b/.test(question)) {
    topics.push('savings');
  }

  // Debt topics (semantic recognition)
  if (/\b(debt|loan|credit.card|interest|pay.off|borrow|lender|mortgage)\b/.test(question) ||
      /\b(owe|owed|owing|liability|payment|installment)\b/.test(question)) {
    topics.push('debt');
  }

  // Risk topics (semantic recognition)
  if (/\b(risk|safe|secure|protect|insurance|hedge|diversify|volatility)\b/.test(question) ||
      /\b(loss|crash|downfall|unstable|uncertain|guarantee)\b/.test(question)) {
    topics.push('risk');
  }

  // Planning topics (semantic recognition)
  if (/\b(plan|goal|future|retirement|tax|insurance|education|marriage)\b/.test(question) ||
      /\b(long.term|short.term|strategy|objective|target|milestone)\b/.test(question)) {
    topics.push('planning');
  }

  // Income topics (semantic recognition)
  if (/\b(income|salary|earn|job|business|passive|side.hustle|freelance)\b/.test(question) ||
      /\b(money.in|revenue|earning|compensation|wage)\b/.test(question)) {
    topics.push('income');
  }

  // Spending topics (semantic recognition)
  if (/\b(spend|expense|buy|purchase|cost|price|shopping|consumption)\b/.test(question) ||
      /\b(money.out|expenditure|outflow|payment|bill)\b/.test(question)) {
    topics.push('spending');
  }

  return topics.length > 0 ? topics : ['general'];
}

/**
 * Recognize specific financial concepts mentioned
 * @param {string} question - Lowercase question
 * @returns {array} Array of concepts
 */
function recognizeFinancialConcepts(question) {
  const concepts = [];

  // Specific financial products/concepts
  const conceptPatterns = {
    'mutual_fund': /\b(mutual.fund|m.f|sip|systematic.investment.plan)\b/,
    'fixed_deposit': /\b(fixed.deposit|fd|term.deposit)\b/,
    'stock': /\b(stock|equity|share|trading|demat)\b/,
    'bond': /\b(bond|debenture|government.securities)\b/,
    'insurance': /\b(insurance|life.insurance|health.insurance|term.insurance)\b/,
    'tax': /\b(tax|income.tax|capital.gains|deduction|80c)\b/,
    'inflation': /\b(inflation|price.rise|cost.of.living|erosion)\b/,
    'compound_interest': /\b(compound.interest|power.of.compounding)\b/,
    'emergency_fund': /\b(emergency.fund|contingency|backup|reserve)\b/,
    'diversification': /\b(diversify|diversification|spread.risk|asset.allocation)\b/
  };

  for (const [concept, pattern] of Object.entries(conceptPatterns)) {
    if (pattern.test(question)) {
      concepts.push(concept);
    }
  }

  return concepts;
}

/**
 * Calculate confidence score for topic identification
 * @param {array} topics - Identified topics
 * @param {array} concepts - Recognized concepts
 * @returns {number} Confidence score (0-0.9)
 */
function calculateConfidenceScore(topics, concepts) {
  let score = 0.5; // Base confidence

  // Higher confidence if multiple topics identified
  if (topics.length > 1) score += 0.2;
  if (topics.length > 2) score += 0.1;

  // Higher confidence if specific concepts recognized
  if (concepts.length > 0) score += 0.2;
  if (concepts.length > 1) score += 0.1;

  // Cap at 0.9 (leave room for uncertainty)
  return Math.min(score, 0.9);
}

module.exports = {
  performSemanticAnalysis,
  classifyQuestionType,
  analyzeQuestionIntent,
  extractTopicsSemantically,
  recognizeFinancialConcepts,
  calculateConfidenceScore
};
