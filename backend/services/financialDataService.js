/**
 * Financial Data Service
 * Integrates with external financial APIs for enhanced insights
 * Provides market data, economic indicators, and financial news
 */

const axios = require('axios');

class FinancialDataService {
  constructor() {
    this.apiKeys = {
      alphaVantage: process.env.ALPHA_VANTAGE_API_KEY,
      financialModelingPrep: process.env.FMP_API_KEY,
      newsApi: process.env.NEWS_API_KEY,
      exchangerate: process.env.EXCHANGE_RATE_API_KEY
    };

    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 15; // 15 minutes
  }

  /**
   * Get market indices and economic indicators
   */
  async getMarketData() {
    const cacheKey = 'market_data';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const promises = [];

      // Get major indices
      if (this.apiKeys.alphaVantage) {
        promises.push(this.getStockIndices());
      }

      // Get economic indicators
      promises.push(this.getEconomicIndicators());

      const results = await Promise.allSettled(promises);
      const marketData = {
        indices: results[0]?.status === 'fulfilled' ? results[0].value : [],
        economic: results[1]?.status === 'fulfilled' ? results[1].value : {},
        timestamp: new Date(),
        source: 'multiple_apis'
      };

      this.cache.set(cacheKey, marketData);
      return marketData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return this.getFallbackMarketData();
    }
  }

  async getStockIndices() {
    if (!this.apiKeys.alphaVantage) return [];

    try {
      const indices = ['SPY', 'QQQ', 'IWM', 'VTI']; // ETF representations of major indices
      const promises = indices.map(symbol =>
        axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: this.apiKeys.alphaVantage
          }
        })
      );

      const results = await Promise.allSettled(promises);
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          const data = result.value.data['Global Quote'];
          if (data) {
            const symbol = indices[index];
            const name = this.getIndexName(symbol);
            return {
              symbol,
              name,
              price: parseFloat(data['05. price']) || 0,
              change: parseFloat(data['09. change']) || 0,
              changePercent: parseFloat(data['10. change percent'].replace('%', '')) || 0,
              volume: parseInt(data['06. volume']) || 0
            };
          }
        }
        return null;
      }).filter(item => item !== null);
    } catch (error) {
      console.error('Error fetching stock indices:', error);
      return [];
    }
  }

  getIndexName(symbol) {
    const names = {
      'SPY': 'S&P 500',
      'QQQ': 'Nasdaq 100',
      'IWM': 'Russell 2000',
      'VTI': 'Total Stock Market'
    };
    return names[symbol] || symbol;
  }

  async getEconomicIndicators() {
    // Simplified economic indicators (in a real app, you'd use more comprehensive APIs)
    const indicators = {
      inflation: { value: 3.1, change: 0.2, unit: '%' },
      unemployment: { value: 3.7, change: -0.1, unit: '%' },
      interestRate: { value: 5.25, change: 0.0, unit: '%' },
      gdp: { value: 2.1, change: 0.1, unit: '%' }
    };

    return {
      ...indicators,
      timestamp: new Date(),
      note: 'Sample data - integrate with real economic APIs for live data'
    };
  }

  /**
   * Get fallback market data when APIs fail
   */
  getFallbackMarketData() {
    return {
      indices: [
        { symbol: 'SPY', name: 'S&P 500', price: 450.00, change: 2.50, changePercent: 0.56 },
        { symbol: 'QQQ', name: 'Nasdaq 100', price: 380.00, change: -1.20, changePercent: -0.31 },
        { symbol: 'IWM', name: 'Russell 2000', price: 180.00, change: 1.80, changePercent: 1.01 }
      ],
      economic: {
        inflation: 3.1,
        unemployment: 3.7,
        gdp: 2.1,
        interestRate: 5.25
      },
      timestamp: new Date(),
      source: 'fallback_data'
    };
  }

  /**
   * Get financial news relevant to user's interests
   */
  async getFinancialNews(topics = ['personal finance', 'investing', 'budgeting']) {
    const cacheKey = `news_${topics.join('_')}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (!this.apiKeys.newsApi) {
      return this.getFallbackNews();
    }

    try {
      const query = topics.join(' OR ');
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 10,
          apiKey: this.apiKeys.newsApi
        }
      });

      const news = response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        imageUrl: article.urlToImage,
        relevance: this.calculateNewsRelevance(article, topics)
      })).sort((a, b) => b.relevance - a.relevance);

      const result = { news, timestamp: new Date() };
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching financial news:', error);
      return this.getFallbackNews();
    }
  }

  /**
   * Get fallback news when API fails
   */
  getFallbackNews() {
    return {
      news: [
        {
          title: "Federal Reserve Signals Potential Rate Cuts in 2026",
          description: "The Federal Reserve has indicated that interest rate cuts may be coming in 2026 as inflation continues to moderate.",
          url: "#",
          source: "Financial Times",
          publishedAt: new Date().toISOString(),
          imageUrl: null,
          relevance: 8
        },
        {
          title: "Tech Stocks Rally on AI Optimism",
          description: "Major technology companies saw gains as investors bet on continued growth in artificial intelligence applications.",
          url: "#",
          source: "Bloomberg",
          publishedAt: new Date().toISOString(),
          imageUrl: null,
          relevance: 7
        },
        {
          title: "Oil Prices Stabilize Above $80 Per Barrel",
          description: "Crude oil prices have found support above $80 per barrel amid supply concerns from major producers.",
          url: "#",
          source: "Reuters",
          publishedAt: new Date().toISOString(),
          imageUrl: null,
          relevance: 6
        }
      ],
      timestamp: new Date()
    };
  }

  calculateNewsRelevance(article, topics) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    let relevance = 0;

    topics.forEach(topic => {
      if (text.includes(topic.toLowerCase())) {
        relevance += 10;
      }
    });

    // Boost recent articles
    const hoursSincePublished = (new Date() - new Date(article.publishedAt)) / (1000 * 60 * 60);
    if (hoursSincePublished < 24) relevance += 5;

    return relevance;
  }

  /**
   * Get currency exchange rates
   */
  async getExchangeRates(baseCurrency = 'USD') {
    const cacheKey = `exchange_${baseCurrency}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (!this.apiKeys.exchangerate) {
      return this.getFallbackExchangeRates(baseCurrency);
    }

    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, {
        params: {
          key: this.apiKeys.exchangerate
        }
      });

      const result = {
        base: baseCurrency,
        rates: response.data.rates,
        timestamp: new Date(),
        date: response.data.date
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return this.getFallbackExchangeRates(baseCurrency);
    }
  }

  /**
   * Get fallback exchange rates when API fails
   */
  getFallbackExchangeRates(baseCurrency = 'USD') {
    const rates = {
      USD: {
        INR: 83.5,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 150.0,
        timestamp: new Date()
      },
      EUR: {
        USD: 1.09,
        INR: 90.8,
        GBP: 0.86,
        JPY: 163.2,
        timestamp: new Date()
      }
    };

    return rates[baseCurrency] || rates.USD;
  }

  /**
   * Get personalized investment recommendations based on risk profile
   */
  async getInvestmentRecommendations(riskProfile, investmentAmount, timeHorizon) {
    const cacheKey = `investments_${riskProfile}_${investmentAmount}_${timeHorizon}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Simplified investment recommendations
    // In a real app, this would integrate with robo-advisor APIs
    const recommendations = this.generateInvestmentRecommendations(riskProfile, investmentAmount, timeHorizon);

    this.cache.set(cacheKey, recommendations);
    return recommendations;
  }

  generateInvestmentRecommendations(riskProfile, amount, horizon) {
    const profiles = {
      conservative: {
        allocation: { bonds: 60, stocks: 30, cash: 10 },
        expectedReturn: 4.5,
        risk: 'Low',
        recommendations: [
          'Focus on high-quality bonds and blue-chip stocks',
          'Consider target-date funds approaching retirement age',
          'Maintain emergency fund of 6-12 months expenses'
        ]
      },
      moderate: {
        allocation: { bonds: 40, stocks: 50, cash: 10 },
        expectedReturn: 6.8,
        risk: 'Medium',
        recommendations: [
          'Balanced mix of stocks and bonds',
          'Include some international exposure',
          'Regular rebalancing every 6-12 months'
        ]
      },
      aggressive: {
        allocation: { bonds: 20, stocks: 70, cash: 10 },
        expectedReturn: 9.2,
        risk: 'High',
        recommendations: [
          'Heavy allocation to growth stocks',
          'Consider emerging markets for higher returns',
          'Be prepared for significant volatility'
        ]
      }
    };

    const profile = profiles[riskProfile] || profiles.moderate;

    return {
      riskProfile,
      allocation: profile.allocation,
      expectedAnnualReturn: profile.expectedReturn,
      riskLevel: profile.risk,
      recommendations: profile.recommendations,
      timeHorizon: horizon,
      investmentAmount: amount,
      projectedValue: this.calculateProjectedValue(amount, profile.expectedReturn, horizon),
      disclaimer: 'This is not personalized investment advice. Consult a financial advisor.',
      timestamp: new Date()
    };
  }

  calculateProjectedValue(principal, annualReturn, years) {
    // Simple compound interest calculation
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;

    return Math.round(principal * Math.pow(1 + monthlyRate, months) * 100) / 100;
  }

  /**
   * Get credit score insights and recommendations
   */
  async getCreditInsights(estimatedScore) {
    // This would integrate with credit bureaus or credit monitoring services
    const insights = {
      score: estimatedScore,
      range: this.getScoreRange(estimatedScore),
      factors: [
        'Payment history (35%)',
        'Credit utilization (30%)',
        'Length of credit history (15%)',
        'New credit (10%)',
        'Credit mix (10%)'
      ],
      recommendations: this.getCreditRecommendations(estimatedScore),
      timestamp: new Date()
    };

    return insights;
  }

  getScoreRange(score) {
    if (score >= 800) return 'Excellent (800-850)';
    if (score >= 740) return 'Very Good (740-799)';
    if (score >= 670) return 'Good (670-739)';
    if (score >= 580) return 'Fair (580-669)';
    return 'Poor (300-579)';
  }

  getCreditRecommendations(score) {
    if (score >= 800) {
      return ['Maintain excellent payment history', 'Keep credit utilization below 10%'];
    } else if (score >= 740) {
      return ['Pay all bills on time', 'Reduce credit card balances', 'Avoid new credit applications'];
    } else if (score >= 670) {
      return ['Pay down high-interest debt', 'Correct any errors on credit report', 'Build positive payment history'];
    } else {
      return ['Focus on paying bills on time', 'Reduce debt levels', 'Avoid collection accounts', 'Consider credit counseling'];
    }
  }

  /**
   * Get retirement planning insights
   */
  async getRetirementInsights(currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn = 7) {
    const yearsToRetirement = retirementAge - currentAge;
    const monthlyReturn = expectedReturn / 100 / 12;

    // Calculate future value of current savings
    const futureValueSavings = currentSavings * Math.pow(1 + monthlyReturn, yearsToRetirement * 12);

    // Calculate future value of monthly contributions
    const futureValueContributions = monthlyContribution *
      (Math.pow(1 + monthlyReturn, yearsToRetirement * 12) - 1) / monthlyReturn;

    const totalRetirementSavings = futureValueSavings + futureValueContributions;

    return {
      currentAge,
      retirementAge,
      yearsToRetirement,
      currentSavings,
      monthlyContribution,
      projectedSavings: Math.round(totalRetirementSavings),
      breakdown: {
        fromCurrentSavings: Math.round(futureValueSavings),
        fromContributions: Math.round(futureValueContributions)
      },
      assumptions: {
        annualReturn: expectedReturn,
        inflationAdjusted: false
      },
      recommendations: this.getRetirementRecommendations(totalRetirementSavings, yearsToRetirement),
      timestamp: new Date()
    };
  }

  getRetirementRecommendations(projectedSavings, yearsToRetirement) {
    const recommendations = [];

    if (projectedSavings < 500000) {
      recommendations.push('Increase monthly contributions');
    }

    if (yearsToRetirement > 30) {
      recommendations.push('Consider higher risk investments for longer time horizon');
    } else if (yearsToRetirement < 10) {
      recommendations.push('Shift to more conservative investments');
    }

    recommendations.push('Maximize employer match in retirement accounts');
    recommendations.push('Consider Roth vs Traditional retirement accounts');

    return recommendations;
  }

  /**
   * Cache management
   */
  isCacheValid(key) {
    if (!this.cache.has(key)) return false;

    const cached = this.cache.get(key);
    if (!cached.timestamp) return false;

    const age = Date.now() - cached.timestamp.getTime();
    return age < this.cacheTimeout;
  }

  /**
   * Fallback data for when APIs are unavailable
   */
  getFallbackMarketData() {
    return {
      indices: [
        { symbol: 'SPY', name: 'S&P 500', price: 450.0, change: 2.5, changePercent: 0.56 },
        { symbol: 'QQQ', name: 'Nasdaq 100', price: 380.0, change: -1.2, changePercent: -0.31 }
      ],
      economic: {
        inflation: { value: 3.1, change: 0.2, unit: '%' },
        unemployment: { value: 3.7, change: -0.1, unit: '%' }
      },
      timestamp: new Date(),
      source: 'fallback_data'
    };
  }

  getFallbackNews() {
    return {
      news: [
        {
          title: 'Understanding Budgeting: A Complete Guide',
          description: 'Learn how to create and maintain a budget that works for your lifestyle.',
          url: '#',
          source: 'Financial Education',
          publishedAt: new Date().toISOString(),
          relevance: 8
        }
      ],
      timestamp: new Date()
    };
  }

  getFallbackExchangeRates(baseCurrency) {
    const rates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35
    };

    return {
      base: baseCurrency,
      rates,
      timestamp: new Date(),
      source: 'fallback_rates'
    };
  }

  /**
   * Test all API connections
   */
  async testConnections() {
    const results = {};

    const tests = [
      { name: 'Alpha Vantage', key: 'alphaVantage', test: () => this.testAlphaVantage() },
      { name: 'News API', key: 'newsApi', test: () => this.testNewsApi() },
      { name: 'Exchange Rate API', key: 'exchangerate', test: () => this.testExchangeRateApi() }
    ];

    for (const test of tests) {
      try {
        if (this.apiKeys[test.key]) {
          results[test.name] = await test.test();
        } else {
          results[test.name] = { available: false, message: 'API key not configured' };
        }
      } catch (error) {
        results[test.name] = { available: false, error: error.message };
      }
    }

    return results;
  }

  async testAlphaVantage() {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: 'IBM',
          apikey: this.apiKeys.alphaVantage
        },
        timeout: 5000
      });
      return { available: true, message: 'Connected successfully' };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  async testNewsApi() {
    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'us',
          apiKey: this.apiKeys.newsApi
        },
        timeout: 5000
      });
      return { available: true, message: 'Connected successfully' };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  async testExchangeRateApi() {
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 5000
      });
      return { available: true, message: 'Connected successfully' };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

module.exports = FinancialDataService;
