/**
 * Gemini AI Integration - Layer 3
 * Uses Google Generative AI (Gemini) to provide natural language explanations
 * and personalized financial advice based on analyzed data and rules
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAI {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generate personalized financial advice using Gemini
   * @param {string} userQuestion - User's question about finances
   * @param {Object} analysis - Output from TransactionAnalyzer
   * @param {Object} rules - Output from RuleEngine
   * @returns {Promise<string>} AI-generated response
   */
  async generateAdvice(userQuestion, analysis, rules) {
    try {
      const prompt = this.buildPrompt(userQuestion, analysis, rules);

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return text;
    } catch (err) {
      console.error('Gemini AI Error:', err);
      throw new Error(`Failed to generate AI advice: ${err.message}`);
    }
  }

  /**
   * Build comprehensive prompt for Gemini
   */
  buildPrompt(userQuestion, analysis, rules) {
    const { userProfile, totalSpent, timeframes, averages, categoryBreakdown, trends } = analysis;
    const { alerts, insights, recommendations, summary } = rules;

    const topCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: ${userProfile.currency}${amt.toFixed(2)}`)
      .join(', ');

    const alertsSummary = alerts
      .slice(0, 3)
      .map(a => `[${a.severity.toUpperCase()}] ${a.message}`)
      .join('\n');

    const insightsSummary = insights.slice(0, 3).join('\n');

    const recommendationsSummary = recommendations
      .slice(0, 3)
      .map(r => `${r.title}: ${r.description}`)
      .join('\n');

    return `You are an expert financial advisor providing personalized, empathetic financial guidance.

USER PROFILE:
- Age: ${userProfile.age || 'Not specified'}
- Annual Income: ${userProfile.income ? userProfile.currency + userProfile.income : 'Not provided'}
- Current Savings: ${userProfile.savings ? userProfile.currency + userProfile.savings : 'Not provided'}
- Currency: ${userProfile.currency}
- Financial Goals: ${userProfile.goals.length > 0 ? userProfile.goals.join(', ') : 'Not specified'}

FINANCIAL HEALTH SCORE: ${summary.overallHealthScore}/100

SPENDING ANALYSIS:
- Total Spent: ${userProfile.currency}${totalSpent.toFixed(2)}
- Monthly Average: ${userProfile.currency}${averages.monthly.toFixed(2)}
- Last 30 Days: ${userProfile.currency}${timeframes.last30Days.toFixed(2)}
- Last 7 Days: ${userProfile.currency}${timeframes.last7Days.toFixed(2)}
- Top Categories: ${topCategories}

ALERTS REQUIRING ATTENTION:
${alertsSummary || 'No critical alerts'}

KEY INSIGHTS:
${insightsSummary || 'No specific insights'}

SYSTEM RECOMMENDATIONS:
${recommendationsSummary || 'Continue monitoring expenses'}

USER QUESTION: "${userQuestion}"

Based on the above financial data analysis:
1. Answer their specific question with concrete, actionable advice
2. Reference their actual spending data and patterns
3. Consider their income and savings when making recommendations
4. Acknowledge any alerts and provide mitigation strategies
5. Be encouraging but honest about their financial situation
6. Suggest specific, measurable actions they can take
7. Keep the response focused but comprehensive (2-4 paragraphs)
8. Use their preferred currency (${userProfile.currency}) in all examples

Provide your personalized financial advice:`;
  }

  /**
   * Generate spending recommendations using Gemini
   */
  async generateRecommendations(analysis, rules) {
    try {
      const { userProfile } = analysis;
      const { summary, alerts, insights } = rules;

      const prompt = `You are a financial advisor. Based on this user's financial situation, provide 3-5 specific, actionable recommendations.

Financial Health Score: ${summary.overallHealthScore}/100
Income: ${userProfile.income ? userProfile.currency + userProfile.income : 'Unknown'}
Savings: ${userProfile.savings ? userProfile.currency + userProfile.savings : 'Unknown'}
Goals: ${userProfile.goals.length > 0 ? userProfile.goals.join(', ') : 'None specified'}

Current Status:
${alerts
  .slice(0, 3)
  .map(a => `- ${a.message}`)
  .join('\n')}

${insights.slice(0, 3).map(i => `- ${i}`).join('\n')}

Provide recommendations in this JSON format:
{
  "recommendations": [
    {
      "title": "Recommendation Title",
      "description": "Specific actionable advice",
      "priority": "high|medium|low",
      "estimatedImpact": "Potential benefit e.g., 'Save $200/month'"
    }
  ],
  "summary": "Overall financial guidance summary"
}

Make recommendations specific, measurable, and achievable.`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : this.getDefaultRecommendations();

      return parsed;
    } catch (err) {
      console.error('Gemini Recommendations Error:', err);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Fallback recommendations if Gemini fails
   */
  getDefaultRecommendations() {
    return {
      recommendations: [
        {
          title: 'Track Your Spending',
          description: 'Continue recording all expenses to identify spending patterns',
          priority: 'high',
          estimatedImpact: 'Better financial awareness',
        },
        {
          title: 'Review Budget',
          description: 'Analyze your top spending categories and look for optimization opportunities',
          priority: 'high',
          estimatedImpact: 'Potential savings of 10-20%',
        },
        {
          title: 'Build Emergency Fund',
          description: 'Allocate 10-20% of savings towards building 3-6 months of expenses',
          priority: 'medium',
          estimatedImpact: 'Financial security',
        },
      ],
      summary:
        'Focus on awareness, budget optimization, and building financial security through emergency savings.',
    };
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const result = await this.model.generateContent('Say "API connection successful" in 5 words');
      return {
        success: true,
        message: result.response.text(),
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

// Create singleton instance
let instance = null;

function getGeminiInstance() {
  if (!instance) {
    instance = new GeminiAI();
  }
  return instance;
}

module.exports = { GeminiAI, getGeminiInstance };
