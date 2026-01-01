/**
 * Financial Analytics Service
 * Advanced financial metrics, KPIs, and predictive analytics
 * for comprehensive financial health assessment
 */

const moment = require('moment');

class FinancialAnalytics {
  constructor() {
    this.kpiCache = new Map();
    this.analyticsCache = new Map();
  }

  /**
   * Calculate comprehensive financial KPIs
   */
  calculateKPIs(analysis, rules) {
    const cacheKey = `${analysis.userId}_${analysis.timeframes.last30Days}`;
    if (this.kpiCache.has(cacheKey)) {
      return this.kpiCache.get(cacheKey);
    }

    const kpis = {
      // Core Financial Health KPIs
      liquidityRatio: this.calculateLiquidityRatio(analysis),
      savingsRate: this.calculateSavingsRate(analysis),
      expenseRatio: this.calculateExpenseRatio(analysis),
      debtServiceRatio: this.calculateDebtServiceRatio(analysis),

      // Spending Efficiency KPIs
      spendingEfficiency: this.calculateSpendingEfficiency(analysis),
      budgetAdherence: this.calculateBudgetAdherence(analysis, rules),
      categoryOptimization: this.calculateCategoryOptimization(analysis),

      // Trend Analysis KPIs
      spendingTrend: this.analyzeSpendingTrend(analysis),
      volatilityIndex: this.calculateVolatilityIndex(analysis),

      // Risk Assessment KPIs
      financialRiskScore: this.calculateFinancialRiskScore(analysis, rules),
      emergencyFundRatio: this.calculateEmergencyFundRatio(analysis),

      // Goal Achievement KPIs
      goalProgressScore: this.calculateGoalProgressScore(analysis),
      investmentReadiness: this.calculateInvestmentReadiness(analysis),

      // Behavioral Finance KPIs
      impulseSpendingRatio: this.calculateImpulseSpendingRatio(analysis),
      financialDisciplineScore: this.calculateFinancialDisciplineScore(analysis, rules)
    };

    this.kpiCache.set(cacheKey, kpis);
    return kpis;
  }

  /**
   * Calculate Liquidity Ratio
   * Measures ability to cover short-term expenses
   */
  calculateLiquidityRatio(analysis) {
    const { userProfile, timeframes, averages } = analysis;
    const monthlyExpenses = averages.monthly || timeframes.last30Days || 0;
    const liquidAssets = (userProfile.savings || 0) + (userProfile.emergencyFund || 0);

    if (monthlyExpenses === 0) return 0;

    // Ideal: 3-6 months of expenses in liquid assets
    const ratio = liquidAssets / monthlyExpenses;

    return {
      ratio: Math.round(ratio * 100) / 100,
      status: ratio >= 3 ? 'excellent' : ratio >= 1 ? 'good' : 'poor',
      monthsCovered: Math.round(ratio * 10) / 10,
      recommendation: ratio < 3 ? 'Build emergency fund to cover 3-6 months of expenses' : null
    };
  }

  /**
   * Calculate Savings Rate
   * Percentage of income saved
   */
  calculateSavingsRate(analysis) {
    const { userProfile, averages } = analysis;
    const monthlyIncome = userProfile.income ? userProfile.income / 12 : 0;
    const monthlyExpenses = averages.monthly || 0;

    if (monthlyIncome === 0) return { rate: 0, status: 'unknown' };

    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;

    return {
      rate: Math.round(savingsRate * 100) / 100,
      status: savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'good' : savingsRate >= 0 ? 'fair' : 'poor',
      target: 20,
      gap: Math.max(0, 20 - savingsRate),
      recommendation: savingsRate < 20 ? `Increase savings by ${Math.round(Math.max(0, 20 - savingsRate))}% of income` : null
    };
  }

  /**
   * Calculate Expense Ratio
   * Expenses as percentage of income
   */
  calculateExpenseRatio(analysis) {
    const { userProfile, averages } = analysis;
    const monthlyIncome = userProfile.income ? userProfile.income / 12 : 0;
    const monthlyExpenses = averages.monthly || 0;

    if (monthlyIncome === 0) return { ratio: 0, status: 'unknown' };

    const expenseRatio = (monthlyExpenses / monthlyIncome) * 100;

    // 50/30/20 rule: 50% needs, 30% wants, 20% savings
    return {
      ratio: Math.round(expenseRatio * 100) / 100,
      status: expenseRatio <= 75 ? 'good' : expenseRatio <= 90 ? 'fair' : 'poor',
      benchmark: 75,
      recommendation: expenseRatio > 75 ? 'Reduce expenses to stay under 75% of income' : null
    };
  }

  /**
   * Calculate Debt Service Ratio
   * Debt payments as percentage of income
   */
  calculateDebtServiceRatio(analysis) {
    const { userProfile } = analysis;
    const monthlyIncome = userProfile.income ? userProfile.income / 12 : 0;
    const monthlyDebtPayments = userProfile.monthlyDebtPayments || 0;

    if (monthlyIncome === 0) return { ratio: 0, status: 'unknown' };

    const debtRatio = (monthlyDebtPayments / monthlyIncome) * 100;

    return {
      ratio: Math.round(debtRatio * 100) / 100,
      status: debtRatio <= 15 ? 'excellent' : debtRatio <= 25 ? 'good' : debtRatio <= 35 ? 'fair' : 'poor',
      benchmark: 15,
      recommendation: debtRatio > 15 ? 'Consider debt consolidation or refinancing' : null
    };
  }

  /**
   * Calculate Spending Efficiency
   * How efficiently money is allocated across categories
   */
  calculateSpendingEfficiency(analysis) {
    const { categoryBreakdown, userProfile, averages } = analysis;
    const monthlyIncome = userProfile.income ? userProfile.income / 12 : 0;
    const monthlyExpenses = averages.monthly || 0;

    if (monthlyIncome === 0 || !categoryBreakdown) return { score: 50, status: 'unknown' };

    // Ideal allocation percentages (50/30/20 rule)
    const idealAllocations = {
      'Housing': 30,
      'Food': 15,
      'Transportation': 15,
      'Utilities': 5,
      'Healthcare': 5,
      'Entertainment': 10,
      'Shopping': 10,
      'Savings': 20
    };

    let efficiencyScore = 100;
    const categoryAnalysis = {};

    Object.entries(categoryBreakdown).forEach(([category, amount]) => {
      const percentage = (amount / monthlyExpenses) * 100;
      const ideal = idealAllocations[category] || 10; // Default 10% for unspecified categories
      const deviation = Math.abs(percentage - ideal);

      // Penalize deviations
      efficiencyScore -= deviation * 0.5;

      categoryAnalysis[category] = {
        actual: Math.round(percentage * 100) / 100,
        ideal: ideal,
        deviation: Math.round(deviation * 100) / 100,
        status: deviation <= 5 ? 'optimal' : deviation <= 15 ? 'acceptable' : 'needs_attention'
      };
    });

    const finalScore = Math.max(0, Math.min(100, efficiencyScore));

    return {
      score: Math.round(finalScore),
      status: finalScore >= 80 ? 'excellent' : finalScore >= 60 ? 'good' : finalScore >= 40 ? 'fair' : 'poor',
      categoryAnalysis,
      recommendation: finalScore < 60 ? 'Rebalance spending across categories for better efficiency' : null
    };
  }

  /**
   * Calculate Budget Adherence
   * How well user sticks to budget limits
   */
  calculateBudgetAdherence(analysis, rules) {
    const { alerts } = rules;
    const budgetAlerts = alerts.filter(alert => alert.type === 'budget' || alert.message.toLowerCase().includes('budget'));

    const adherenceScore = Math.max(0, 100 - (budgetAlerts.length * 15));

    return {
      score: adherenceScore,
      status: adherenceScore >= 80 ? 'excellent' : adherenceScore >= 60 ? 'good' : 'needs_improvement',
      alertsCount: budgetAlerts.length,
      recommendation: adherenceScore < 80 ? 'Set realistic budgets and track adherence weekly' : null
    };
  }

  /**
   * Calculate Category Optimization Score
   * Identifies overspending categories
   */
  calculateCategoryOptimization(analysis) {
    const { categoryBreakdown, userProfile, averages } = analysis;
    const monthlyIncome = userProfile.income ? userProfile.income / 12 : 0;
    const monthlyExpenses = averages.monthly || 0;

    if (!categoryBreakdown || monthlyIncome === 0) return { score: 50, optimizations: [] };

    const optimizations = [];
    let totalSavingsPotential = 0;

    // Analyze each category for optimization opportunities
    Object.entries(categoryBreakdown).forEach(([category, amount]) => {
      const percentage = (amount / monthlyExpenses) * 100;

      // Category-specific benchmarks
      const benchmarks = {
        'Dining Out': { max: 8, savings: 0.3 },
        'Entertainment': { max: 6, savings: 0.25 },
        'Shopping': { max: 8, savings: 0.4 },
        'Transportation': { max: 12, savings: 0.2 },
        'Groceries': { max: 15, savings: 0.15 }
      };

      const benchmark = benchmarks[category];
      if (benchmark && percentage > benchmark.max) {
        const excess = amount - (monthlyExpenses * benchmark.max / 100);
        const potentialSavings = excess * benchmark.savings;

        optimizations.push({
          category,
          currentSpend: Math.round(amount * 100) / 100,
          recommendedSpend: Math.round((monthlyExpenses * benchmark.max / 100) * 100) / 100,
          potentialSavings: Math.round(potentialSavings * 100) / 100,
          priority: percentage > benchmark.max * 1.5 ? 'high' : 'medium'
        });

        totalSavingsPotential += potentialSavings;
      }
    });

    const optimizationScore = Math.max(0, 100 - (optimizations.length * 10));

    return {
      score: optimizationScore,
      status: optimizationScore >= 80 ? 'optimized' : optimizationScore >= 60 ? 'good' : 'needs_optimization',
      optimizations: optimizations.sort((a, b) => b.potentialSavings - a.potentialSavings),
      totalSavingsPotential: Math.round(totalSavingsPotential * 100) / 100
    };
  }

  /**
   * Analyze Spending Trend
   */
  analyzeSpendingTrend(analysis) {
    const { trends, timeframes } = analysis;

    if (!trends || !timeframes) return { trend: 'stable', confidence: 0.5 };

    const recent = timeframes.last30Days || 0;
    const previous = timeframes.last60Days ? (timeframes.last60Days - recent) / 2 : recent;

    if (previous === 0) return { trend: 'stable', confidence: 0.5 };

    const changePercent = ((recent - previous) / previous) * 100;

    let trend = 'stable';
    let confidence = 0.7;

    if (changePercent > 10) {
      trend = 'increasing';
      confidence = 0.8;
    } else if (changePercent < -10) {
      trend = 'decreasing';
      confidence = 0.8;
    }

    return {
      trend,
      changePercent: Math.round(changePercent * 100) / 100,
      confidence,
      recommendation: trend === 'increasing' ? 'Monitor spending closely and identify causes' :
                     trend === 'decreasing' ? 'Great progress! Maintain current habits' : null
    };
  }

  /**
   * Calculate Volatility Index
   * Measures spending consistency
   */
  calculateVolatilityIndex(analysis) {
    // This would require historical data points
    // For now, return a basic calculation
    return {
      index: 25, // 0-100 scale, lower is better
      status: 'moderate',
      recommendation: 'Track spending for several months to calculate accurate volatility'
    };
  }

  /**
   * Calculate Financial Risk Score
   */
  calculateFinancialRiskScore(analysis, rules) {
    const { summary, alerts } = rules;
    const baseScore = summary.overallHealthScore;

    // Adjust for risk factors
    let riskAdjustments = 0;

    alerts.forEach(alert => {
      if (alert.severity === 'high') riskAdjustments -= 15;
      else if (alert.severity === 'medium') riskAdjustments -= 8;
    });

    const riskScore = Math.max(0, Math.min(100, baseScore + riskAdjustments));

    return {
      score: riskScore,
      level: riskScore >= 70 ? 'low' : riskScore >= 40 ? 'moderate' : 'high',
      factors: alerts.map(a => a.message),
      recommendation: riskScore < 40 ? 'Address high-priority alerts immediately' : null
    };
  }

  /**
   * Calculate Emergency Fund Ratio
   */
  calculateEmergencyFundRatio(analysis) {
    return this.calculateLiquidityRatio(analysis); // Reuse liquidity calculation
  }

  /**
   * Calculate Goal Progress Score
   */
  calculateGoalProgressScore(analysis) {
    const { userProfile } = analysis;
    const goals = userProfile.goals || [];

    if (goals.length === 0) return { score: 50, status: 'no_goals_set' };

    // Basic goal progress calculation
    // This would need more detailed goal tracking
    return {
      score: 65,
      status: 'on_track',
      recommendation: 'Set specific, measurable financial goals'
    };
  }

  /**
   * Calculate Investment Readiness
   */
  calculateInvestmentReadiness(analysis) {
    const liquidity = this.calculateLiquidityRatio(analysis);
    const savings = this.calculateSavingsRate(analysis);
    const risk = this.calculateFinancialRiskScore(analysis, { summary: { overallHealthScore: 50 }, alerts: [] });

    const readinessScore = (liquidity.ratio * 0.3) + (savings.rate * 0.3) + (risk.score * 0.4);

    return {
      score: Math.round(Math.min(100, readinessScore)),
      status: readinessScore >= 70 ? 'ready' : readinessScore >= 40 ? 'preparing' : 'not_ready',
      requirements: readinessScore < 70 ? ['Build emergency fund', 'Increase savings rate', 'Reduce high-interest debt'] : []
    };
  }

  /**
   * Calculate Impulse Spending Ratio
   */
  calculateImpulseSpendingRatio(analysis) {
    const { categoryBreakdown } = analysis;

    if (!categoryBreakdown) return { ratio: 0, status: 'unknown' };

    // Categories often associated with impulse spending
    const impulseCategories = ['Shopping', 'Entertainment', 'Dining Out', 'Online Shopping'];
    const totalSpending = Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0);
    const impulseSpending = impulseCategories.reduce((sum, category) =>
      sum + (categoryBreakdown[category] || 0), 0);

    const ratio = totalSpending > 0 ? (impulseSpending / totalSpending) * 100 : 0;

    return {
      ratio: Math.round(ratio * 100) / 100,
      status: ratio <= 20 ? 'controlled' : ratio <= 35 ? 'moderate' : 'high',
      recommendation: ratio > 35 ? 'Reduce impulse purchases and plan discretionary spending' : null
    };
  }

  /**
   * Calculate Financial Discipline Score
   */
  calculateFinancialDisciplineScore(analysis, rules) {
    const budgetAdherence = this.calculateBudgetAdherence(analysis, rules);
    const savingsRate = this.calculateSavingsRate(analysis);
    const impulseRatio = this.calculateImpulseSpendingRatio(analysis);

    const disciplineScore = (budgetAdherence.score * 0.4) +
                           (savingsRate.rate * 0.4) +
                           ((100 - impulseRatio.ratio) * 0.2);

    return {
      score: Math.round(Math.min(100, disciplineScore)),
      status: disciplineScore >= 70 ? 'excellent' : disciplineScore >= 50 ? 'good' : 'needs_improvement',
      recommendation: disciplineScore < 50 ? 'Focus on budgeting, saving regularly, and reducing impulse spending' : null
    };
  }

  /**
   * Generate comprehensive financial health report
   */
  generateFinancialHealthReport(analysis, rules) {
    const kpis = this.calculateKPIs(analysis, rules);

    return {
      overallScore: this.calculateOverallHealthScore(kpis),
      kpis,
      summary: this.generateHealthSummary(kpis),
      recommendations: this.generateRecommendations(kpis),
      trends: this.analyzeTrends(analysis),
      projections: this.generateProjections(analysis, kpis)
    };
  }

  calculateOverallHealthScore(kpis) {
    const weights = {
      liquidityRatio: 0.15,
      savingsRate: 0.20,
      expenseRatio: 0.15,
      spendingEfficiency: 0.10,
      budgetAdherence: 0.10,
      financialRiskScore: 0.15,
      financialDisciplineScore: 0.15
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([kpi, weight]) => {
      const value = kpis[kpi];
      if (value && typeof value.score === 'number') {
        totalScore += value.score * weight;
        totalWeight += weight;
      } else if (typeof value === 'object' && value.rate !== undefined) {
        // Handle savingsRate which uses 'rate' instead of 'score'
        const normalizedScore = Math.min(100, Math.max(0, value.rate * 5)); // Convert percentage to 0-100 scale
        totalScore += normalizedScore * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  }

  generateHealthSummary(kpis) {
    const overallScore = this.calculateOverallHealthScore(kpis);

    if (overallScore >= 80) {
      return "Excellent financial health! You're making great progress toward your financial goals.";
    } else if (overallScore >= 60) {
      return "Good financial standing with room for improvement. Focus on key areas to strengthen your position.";
    } else if (overallScore >= 40) {
      return "Fair financial health. Address critical areas to improve stability and reach your goals.";
    } else {
      return "Financial health needs attention. Take immediate steps to improve spending habits and build security.";
    }
  }

  generateRecommendations(kpis) {
    const recommendations = [];

    Object.entries(kpis).forEach(([kpiName, kpiData]) => {
      if (kpiData.recommendation) {
        recommendations.push({
          kpi: kpiName,
          priority: this.determinePriority(kpiData),
          recommendation: kpiData.recommendation,
          impact: this.estimateImpact(kpiData)
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  determinePriority(kpiData) {
    if (kpiData.status === 'poor' || kpiData.status === 'high' || kpiData.status === 'needs_attention') {
      return 'high';
    } else if (kpiData.status === 'fair' || kpiData.status === 'moderate') {
      return 'medium';
    }
    return 'low';
  }

  estimateImpact(kpiData) {
    // Estimate potential improvement impact
    if (kpiData.potentialSavings) {
      return `Save up to ${kpiData.potentialSavings} per month`;
    } else if (kpiData.gap) {
      return `Improve score by ${Math.round(kpiData.gap)} points`;
    }
    return 'Improve financial health';
  }

  analyzeTrends(analysis) {
    return {
      spending: this.analyzeSpendingTrend(analysis),
      category: this.analyzeCategoryTrends(analysis),
      seasonal: this.analyzeSeasonalPatterns(analysis)
    };
  }

  analyzeCategoryTrends(analysis) {
    // Basic category trend analysis
    return {
      topGrowing: [],
      topDeclining: [],
      stable: []
    };
  }

  analyzeSeasonalPatterns(analysis) {
    // Basic seasonal analysis
    return {
      patterns: [],
      recommendations: []
    };
  }

  generateProjections(analysis, kpis) {
    const { userProfile, averages } = analysis;
    const monthlyIncome = userProfile.income ? userProfile.income / 12 : 0;
    const monthlyExpenses = averages.monthly || 0;
    const currentSavings = userProfile.savings || 0;

    const projections = [];

    // 3-month projection
    for (let months = 3; months <= 12; months += 3) {
      const projectedSavings = currentSavings + ((monthlyIncome - monthlyExpenses) * months);
      const projectedNetWorth = projectedSavings; // Simplified

      projections.push({
        timeframe: `${months} months`,
        projectedSavings: Math.round(projectedSavings * 100) / 100,
        projectedNetWorth: Math.round(projectedNetWorth * 100) / 100,
        confidence: Math.max(0.5, 1 - (months * 0.05)) // Decreasing confidence over time
      });
    }

    return projections;
  }

  /**
   * Clear caches (useful for testing or when data changes)
   */
  clearCaches() {
    this.kpiCache.clear();
    this.analyticsCache.clear();
  }

  /**
   * Generate comprehensive analytics for dashboard
   */
  async generateAnalytics(analysis, rules, user) {
    console.log('📊 Generating comprehensive financial analytics...');

    try {
      // Calculate KPIs
      const kpis = this.calculateKPIs(analysis, rules);

      // Generate insights
      const insights = this.generateInsights(analysis, kpis, rules);

      // Calculate projections
      const projections = this.generateProjections(analysis, kpis);

      // Determine savings rate status
      const savingsRate = kpis.savingsRate || 0;
      let savingsRateStatus = 'poor';
      if (savingsRate >= 20) savingsRateStatus = 'excellent';
      else if (savingsRate >= 15) savingsRateStatus = 'good';
      else if (savingsRate >= 10) savingsRateStatus = 'fair';

      // Determine expense ratio status
      const expenseRatio = kpis.expenseRatio || 100;
      let expenseRatioStatus = 'poor';
      if (expenseRatio <= 60) expenseRatioStatus = 'excellent';
      else if (expenseRatio <= 75) expenseRatioStatus = 'good';
      else if (expenseRatio <= 85) expenseRatioStatus = 'fair';

      return {
        kpis,
        insights,
        projections,
        savingsRate,
        savingsRateStatus,
        expenseRatio,
        expenseRatioStatus,
        summary: {
          overallScore: rules.summary?.overallHealthScore || 70,
          riskLevel: kpis.financialRiskScore < 30 ? 'Low' : kpis.financialRiskScore < 70 ? 'Medium' : 'High',
          recommendationsCount: rules.recommendations?.length || 0
        }
      };

    } catch (error) {
      console.error('❌ Error generating analytics:', error.message);
      // Return basic analytics on error
      return {
        savingsRate: 15,
        savingsRateStatus: 'good',
        expenseRatio: 75,
        expenseRatioStatus: 'fair',
        kpis: {},
        insights: [],
        projections: []
      };
    }
  }
}

module.exports = FinancialAnalytics;
