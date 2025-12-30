/**
 * Transaction Analyzer - Layer 1
 * Extracts and calculates financial metrics from user's expense data
 * Returns structured data for Rule Engine to process
 */

const Expense = require('../models/Expense');
const User = require('../models/User');

class TransactionAnalyzer {
  /**
   * Analyze user's expenses and return structured financial data
   * @param {string} userId - MongoDB user ID
   * @returns {Promise<Object>} Analyzed financial metrics
   */
  static async analyzeExpenses(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Fetch all expenses
      const allExpenses = await Expense.find({ user: userId }).sort({ date: -1 });

      if (allExpenses.length === 0) {
        return {
          totalExpenses: 0,
          expenses: [],
          totalSpent: 0,
          categoryBreakdown: {},
          timeframes: {
            last7Days: 0,
            last30Days: 0,
            last90Days: 0,
            lastYear: 0,
          },
          averages: {
            daily: 0,
            weekly: 0,
            monthly: 0,
          },
          trends: {
            monthOverMonth: [],
            categoryTrends: {},
          },
          userProfile: {
            income: user.profile?.income || null,
            savings: user.profile?.savings || null,
            currency: user.profile?.currency || 'USD',
            goals: user.profile?.goals || [],
          },
        };
      }

      // Calculate total spent
      const totalSpent = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      // Get date references
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      // Calculate timeframe totals
      const spentLast7 = allExpenses
        .filter(exp => new Date(exp.date) >= last7Days)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const spentLast30 = allExpenses
        .filter(exp => new Date(exp.date) >= last30Days)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const spentLast90 = allExpenses
        .filter(exp => new Date(exp.date) >= last90Days)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const spentLastYear = allExpenses
        .filter(exp => new Date(exp.date) >= lastYear)
        .reduce((sum, exp) => sum + exp.amount, 0);

      // Calculate category breakdown
      const categoryBreakdown = {};
      const categoryCount = {};
      allExpenses.forEach(exp => {
        categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
        categoryTrends[exp.category] = (categoryTrends[exp.category] || 0) + 1;
      });

      // Calculate averages
      const daysOfExpenses = Math.max(
        1,
        Math.round(
          (new Date(allExpenses[0].date) - new Date(allExpenses[allExpenses.length - 1].date)) /
            (24 * 60 * 60 * 1000)
        )
      );
      const dailyAverage = totalSpent / daysOfExpenses;
      const weeklyAverage = dailyAverage * 7;
      const monthlyAverage = dailyAverage * 30;

      // Calculate month-over-month trend
      const monthlyData = {};
      allExpenses.forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + exp.amount;
      });

      const months = Object.keys(monthlyData).sort();
      const monthOverMonth = [];
      for (let i = 1; i < months.length; i++) {
        const prevAmount = monthlyData[months[i - 1]];
        const currAmount = monthlyData[months[i]];
        const change = ((currAmount - prevAmount) / prevAmount) * 100;
        monthOverMonth.push({
          month: months[i],
          amount: currAmount,
          changePercent: parseFloat(change.toFixed(2)),
        });
      }

      // Calculate category trends (category breakdown over last 3 months)
      const categoryTrends = {};
      const last3Months = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const recentExpenses = allExpenses.filter(exp => new Date(exp.date) >= last3Months);

      recentExpenses.forEach(exp => {
        if (!categoryTrends[exp.category]) {
          categoryTrends[exp.category] = {
            total: 0,
            count: 0,
            percentage: 0,
          };
        }
        categoryTrends[exp.category].total += exp.amount;
        categoryTrends[exp.category].count += 1;
      });

      // Calculate percentages
      const recentTotal = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      Object.keys(categoryTrends).forEach(cat => {
        categoryTrends[cat].percentage = parseFloat(
          ((categoryTrends[cat].total / recentTotal) * 100).toFixed(2)
        );
      });

      return {
        totalExpenses: allExpenses.length,
        expenses: allExpenses.slice(0, 20).map(exp => ({
          date: exp.date,
          category: exp.category,
          amount: exp.amount,
          description: exp.description,
        })),
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        categoryBreakdown: Object.fromEntries(
          Object.entries(categoryBreakdown).map(([cat, amt]) => [
            cat,
            parseFloat(amt.toFixed(2)),
          ])
        ),
        timeframes: {
          last7Days: parseFloat(spentLast7.toFixed(2)),
          last30Days: parseFloat(spentLast30.toFixed(2)),
          last90Days: parseFloat(spentLast90.toFixed(2)),
          lastYear: parseFloat(spentLastYear.toFixed(2)),
        },
        averages: {
          daily: parseFloat(dailyAverage.toFixed(2)),
          weekly: parseFloat(weeklyAverage.toFixed(2)),
          monthly: parseFloat(monthlyAverage.toFixed(2)),
        },
        trends: {
          monthOverMonth: monthOverMonth,
          categoryTrends: categoryTrends,
        },
        userProfile: {
          income: user.profile?.income || null,
          savings: user.profile?.savings || null,
          currency: user.profile?.currency || 'USD',
          goals: user.profile?.goals || [],
          age: user.profile?.age || null,
        },
      };
    } catch (err) {
      console.error('Transaction Analyzer Error:', err);
      throw err;
    }
  }

  /**
   * Get formatted context string for AI consumption
   */
  static formatAnalysisForAI(analysis) {
    const { userProfile, totalSpent, timeframes, averages, categoryBreakdown, trends } = analysis;

    const topCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: ${userProfile.currency}${amt}`)
      .join('; ');

    return `
FINANCIAL DATA ANALYSIS:
- Total Spent: ${userProfile.currency}${totalSpent}
- Last 30 Days: ${userProfile.currency}${timeframes.last30Days}
- Monthly Average: ${userProfile.currency}${averages.monthly}
- Top Categories: ${topCategories}
- Income: ${userProfile.income ? userProfile.currency + userProfile.income : 'Not provided'}
- Savings: ${userProfile.savings ? userProfile.currency + userProfile.savings : 'Not provided'}
    `.trim();
  }
}

module.exports = TransactionAnalyzer;
