/**
 * Rule Engine - Layer 2
 * Applies hard financial rules to analyzed data
 * Generates actionable insights and alerts
 */

class RuleEngine {
  /**
   * Apply financial rules to analyzed data
   * @param {Object} analysis - Output from TransactionAnalyzer
   * @returns {Object} Rules-based insights and alerts
   */
  static applyRules(analysis) {
    const insights = [];
    const alerts = [];
    const recommendations = [];

    const {
      userProfile,
      totalSpent,
      timeframes,
      averages,
      categoryBreakdown,
      trends,
      expenses,
    } = analysis;

    // Rule 1: Spending Trend Analysis
    if (trends.monthOverMonth.length >= 2) {
      const lastMonthChange = trends.monthOverMonth[trends.monthOverMonth.length - 1].changePercent;
      if (lastMonthChange > 20) {
        alerts.push({
          type: 'SPENDING_INCREASE',
          severity: 'high',
          message: `Your spending increased by ${lastMonthChange}% this month. Review your expenses.`,
        });
        insights.push(`Spending surge detected: +${lastMonthChange}% vs. previous month`);
      } else if (lastMonthChange < -15) {
        insights.push(`Great job! You reduced spending by ${Math.abs(lastMonthChange)}% this month.`);
        recommendations.push({
          priority: 'low',
          title: 'Maintain Momentum',
          description: `Keep up the good work! You've reduced your spending. Continue this pattern.`,
        });
      }
    }

    // Rule 2: Budget Health Check (if income is provided)
    if (userProfile.income) {
      const monthlyIncome = userProfile.income / 12;
      const spendingRatio = averages.monthly / monthlyIncome;
      const savingsRate = ((monthlyIncome - averages.monthly) / monthlyIncome) * 100;

      if (spendingRatio > 0.9) {
        alerts.push({
          type: 'HIGH_SPENDING_RATIO',
          severity: 'critical',
          message: `You're spending ${(spendingRatio * 100).toFixed(1)}% of your monthly income. Increase savings.`,
        });
      } else if (spendingRatio > 0.75) {
        alerts.push({
          type: 'ELEVATED_SPENDING',
          severity: 'medium',
          message: `You're spending ${(spendingRatio * 100).toFixed(1)}% of monthly income. Consider cutting back.`,
        });
        insights.push(`Your savings rate is approximately ${savingsRate.toFixed(1)}%`);
      } else if (spendingRatio < 0.6) {
        insights.push(
          `Excellent savings rate! You're saving approximately ${savingsRate.toFixed(1)}% of your income.`
        );
        recommendations.push({
          priority: 'low',
          title: 'Invest Your Savings',
          description:
            'Consider investing your savings to build long-term wealth and achieve your financial goals.',
        });
      }
    }

    // Rule 3: Category Spending Analysis
    const categoryEntries = Object.entries(categoryBreakdown)
      .map(([cat, amt]) => ({ category: cat, amount: amt }))
      .sort((a, b) => b.amount - a.amount);

    if (categoryEntries.length > 0) {
      const topCategory = categoryEntries[0];
      const topSpendingPercent = (topCategory.amount / totalSpent) * 100;

      if (topSpendingPercent > 40) {
        alerts.push({
          type: 'DOMINANT_CATEGORY',
          severity: 'medium',
          message: `${topCategory.category} accounts for ${topSpendingPercent.toFixed(1)}% of your spending. Consider optimizing.`,
        });
      }

      // Check for unusual category spending
      const avgCategorySpend = totalSpent / categoryEntries.length;
      categoryEntries.forEach(cat => {
        if (cat.amount > avgCategorySpend * 2) {
          recommendations.push({
            priority: 'medium',
            title: `Review ${this.capitalize(cat.category)} Spending`,
            description: `Your ${cat.category} expenses (${userProfile.currency}${cat.amount.toFixed(2)}) are significantly higher than average. Look for optimization opportunities.`,
          });
        }
      });
    }

    // Rule 4: Recent Spending Pattern (Last 7 days)
    const last7DaysAverage = timeframes.last7Days / 7;
    const last30DaysAverage = timeframes.last30Days / 30;

    if (last7DaysAverage > last30DaysAverage * 1.3) {
      alerts.push({
        type: 'SPIKE_DETECTED',
        severity: 'medium',
        message: `Recent spending is ${((last7DaysAverage / last30DaysAverage) * 100 - 100).toFixed(1)}% above your monthly average. Check your recent transactions.`,
      });
    }

    // Rule 5: Savings Account Check
    if (userProfile.savings && userProfile.income) {
      const savingsMonths = userProfile.savings / averages.monthly;
      if (savingsMonths < 3) {
        alerts.push({
          type: 'LOW_EMERGENCY_FUND',
          severity: 'high',
          message: `Your emergency fund (${savingsMonths.toFixed(1)} months of expenses) is below recommended 3-6 months.`,
        });
        recommendations.push({
          priority: 'high',
          title: 'Build Emergency Fund',
          description: `Aim to save 3-6 months of expenses. Currently at ${savingsMonths.toFixed(1)} months.`,
        });
      } else if (savingsMonths >= 6) {
        insights.push(
          `Strong emergency fund! You have ${savingsMonths.toFixed(1)} months of expenses saved.`
        );
      }
    }

    // Rule 6: Financial Goals Assessment
    if (userProfile.goals && userProfile.goals.length > 0) {
      insights.push(`Active goals: ${userProfile.goals.join(', ')}`);
      recommendations.push({
        priority: 'medium',
        title: 'Track Goal Progress',
        description: `Monitor your ${userProfile.goals[0]} goal. Allocate part of your savings towards it.`,
      });
    }

    // Rule 7: Expense Frequency Analysis
    if (expenses.length > 10) {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const recentExpenses = expenses.filter(exp => new Date(exp.date) >= yesterday);

      if (recentExpenses.length > 5) {
        insights.push(
          `You recorded ${recentExpenses.length} expenses recently. Stay mindful of frequent small purchases.`
        );
      }
    }

    // Rule 8: Budget Alerts
    if (analysis.budgets && analysis.budgets.length > 0) {
      analysis.budgets.forEach(budget => {
        if (budget.status === 'exceeded') {
          alerts.push({
            type: 'BUDGET_EXCEEDED',
            severity: 'high',
            message: `You've exceeded your ${budget.category} budget by ${userProfile.currency}${(budget.spent - budget.budgetAmount).toFixed(2)}. Review your spending.`,
          });
        } else if (budget.status === 'warning') {
          alerts.push({
            type: 'BUDGET_WARNING',
            severity: 'medium',
            message: `You're at ${budget.percentage}% of your ${budget.category} budget. Consider reducing spending in this category.`,
          });
        }

        // Add insights for budget performance
        if (budget.percentage < 50) {
          insights.push(`Great job staying under budget for ${budget.category} (${budget.percentage}% used)`);
        }
      });

      recommendations.push({
        priority: 'medium',
        title: 'Monitor Budgets',
        description: `You have ${analysis.budgets.length} active budget(s). Regular monitoring helps maintain financial discipline.`,
      });
    } else {
      // No budgets set - recommend setting them up
      recommendations.push({
        priority: 'high',
        title: 'Set Up Budgets',
        description: 'Create category budgets to track spending and prevent overspending. Start with your highest spending categories.',
      });
    }

    // Remove duplicates from insights
    const uniqueInsights = [...new Set(insights)];

    // Sort alerts by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
      alerts,
      insights: uniqueInsights,
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
      summary: {
        alertCount: alerts.length,
        insightCount: uniqueInsights.length,
        recommendationCount: recommendations.length,
        overallHealthScore: this.calculateHealthScore(
          alerts,
          uniqueInsights,
          analysis.userProfile
        ),
      },
    };
  }

  /**
   * Calculate overall financial health score (0-100)
   */
  static calculateHealthScore(alerts, insights, userProfile) {
    let score = 80; // Start with good score

    // Deduct for alerts
    alerts.forEach(alert => {
      const deduction = { critical: 20, high: 15, medium: 10, low: 5 };
      score -= deduction[alert.severity] || 0;
    });

    // Add for positive insights
    score += Math.min(insights.length * 2, 15);

    // Boost if income provided
    if (userProfile.income) score += 5;

    // Boost if savings goals exist
    if (userProfile.goals && userProfile.goals.length > 0) score += 5;

    return Math.max(0, Math.min(100, score)); // Clamp to 0-100
  }

  /**
   * Capitalize first letter
   */
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate a summary message for the AI
   */
  static generateSummaryForAI(rules) {
    const { alerts, insights, recommendations, summary } = rules;

    let summaryText = `Financial Health Score: ${summary.overallHealthScore}/100\n\n`;

    if (alerts.length > 0) {
      summaryText += `ALERTS (${alerts.length}):\n`;
      alerts.slice(0, 3).forEach(alert => {
        summaryText += `- [${alert.severity.toUpperCase()}] ${alert.message}\n`;
      });
      summaryText += '\n';
    }

    if (insights.length > 0) {
      summaryText += `KEY INSIGHTS:\n`;
      insights.slice(0, 3).forEach(insight => {
        summaryText += `- ${insight}\n`;
      });
      summaryText += '\n';
    }

    if (recommendations.length > 0) {
      summaryText += `TOP RECOMMENDATIONS:\n`;
      recommendations.slice(0, 3).forEach(rec => {
        summaryText += `- [${rec.priority.toUpperCase()}] ${rec.title}: ${rec.description}\n`;
      });
    }

    return summaryText;
  }
}

module.exports = RuleEngine;
