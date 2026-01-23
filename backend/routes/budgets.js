const express = require('express');
const getBudget = () => require('../models/Budget')();
const auth = require('../middleware/auth');

const router = express.Router();

// Budget categories (same as expenses)
const CATEGORIES = ['food', 'transport', 'entertainment', 'utilities', 'health', 'education', 'family', 'other'];

// Get all budgets for user
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔵 GET /budgets - User ID:', req.user._id);
    const budgets = await getBudget().find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    console.log('✅ Found budgets:', budgets.length);
    res.json(budgets);
  } catch (err) {
    console.error('❌ Error fetching budgets:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new budget
router.post('/', auth, async (req, res) => {
  try {
    console.log('🔵 POST /budgets - Creating new budget');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);
    
    const { category, amount, period, alerts } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ message: 'Category and amount are required' });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Check if budget already exists for this category
    const existingBudget = await getBudget().findOne({
      user: req.user._id,
      category,
      isActive: true
    });

    if (existingBudget) {
      return res.status(400).json({ message: 'Budget already exists for this category' });
    }

    const budget = new (getBudget())({
      user: req.user._id,
      category,
      amount,
      period: period || 'monthly',
      alerts: alerts || { enabled: true, thresholds: [80, 100] }
    });

    await budget.save();
    console.log('✅ Budget saved:', budget._id);
    res.status(201).json(budget);
  } catch (err) {
    console.error('❌ Error creating budget:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Update a budget
router.put('/:id', auth, async (req, res) => {
  try {
    const { category, amount, period, alerts, isActive } = req.body;

    const budget = await getBudget().findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Update fields
    if (category) budget.category = category;
    if (amount !== undefined) budget.amount = amount;
    if (period) budget.period = period;
    if (alerts) budget.alerts = alerts;
    if (isActive !== undefined) budget.isActive = isActive;

    await budget.save();
    res.json(budget);
  } catch (err) {
    console.error('Error updating budget:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a budget
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('🔵 DELETE /budgets/:id - Budget ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    const budget = await getBudget().findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      console.log('❌ Budget not found');
      return res.status(404).json({ message: 'Budget not found' });
    }

    console.log('✅ Budget deleted:', budget._id);
    res.json({ message: 'Budget deleted successfully', budget });
  } catch (err) {
    console.error('❌ Error deleting budget:', err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Get budget status with current spending
router.get('/:id/status', auth, async (req, res) => {
  try {
    const budget = await getBudget().findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Calculate current period spending for this category
    const getExpense = () => require('../models/Expense')();
    const Expense = getExpense();

    const now = new Date();
    let periodStart;

    switch (budget.period) {
      case 'weekly':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodExpenses = await Expense.find({
      user: req.user._id,
      category: budget.category,
      date: { $gte: periodStart }
    });

    const spent = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    // Check for alerts
    const alerts = [];
    if (budget.alerts.enabled) {
      budget.alerts.thresholds.forEach(threshold => {
        if (percentage >= threshold && spent > 0) {
          alerts.push({
            threshold,
            message: `You've spent ${percentage.toFixed(1)}% of your ${budget.category} budget`,
            type: percentage >= 100 ? 'danger' : 'warning'
          });
        }
      });
    }

    res.json({
      budget,
      status: {
        spent,
        remaining,
        percentage: parseFloat(percentage.toFixed(1)),
        period: budget.period,
        periodStart,
        periodEnd: now
      },
      alerts
    });
  } catch (err) {
    console.error('Error getting budget status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all budget statuses
router.get('/status/all', auth, async (req, res) => {
  try {
    const budgets = await getBudget().find({ user: req.user._id, isActive: true });

    const budgetStatuses = await Promise.all(
      budgets.map(async (budget) => {
        // Reuse the status calculation logic
        const getExpense = () => require('../models/Expense')();
        const Expense = getExpense();

        const now = new Date();
        let periodStart;

        switch (budget.period) {
          case 'weekly':
            periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'yearly':
            periodStart = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const periodExpenses = await Expense.find({
          user: req.user._id,
          category: budget.category,
          date: { $gte: periodStart }
        });

        const spent = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = budget.amount - spent;
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          budget,
          status: {
            spent,
            remaining,
            percentage: parseFloat(percentage.toFixed(1)),
            period: budget.period,
            periodStart,
            periodEnd: now
          }
        };
      })
    );

    res.json(budgetStatuses);
  } catch (err) {
    console.error('Error getting budget statuses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;