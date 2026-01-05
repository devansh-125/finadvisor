const express = require('express');
const getExpense = () => require('../models/Expense')();
const auth = require('../middleware/auth');

const router = express.Router();

// Expense categories
const CATEGORIES = ['food', 'transport', 'entertainment', 'utilities', 'health', 'education', 'family', 'other'];

// Get all expenses for user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await getExpense().find({ user: req.user }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics/summary for dashboard
router.get('/analytics/summary', auth, async (req, res) => {
  try {
    const expenses = await getExpense().find({ user: req.user });
    
    // Total expenses
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Category breakdown
    const byCategory = {};
    CATEGORIES.forEach(cat => {
      byCategory[cat] = expenses
        .filter(exp => exp.category === cat)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });
    
    // Monthly breakdown
    const byMonth = {};
    expenses.forEach(exp => {
      const monthKey = new Date(exp.date).toISOString().slice(0, 7); // YYYY-MM
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = 0;
      }
      byMonth[monthKey] += exp.amount;
    });
    
    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentExpenses = expenses.filter(exp => new Date(exp.date) >= thirtyDaysAgo);
    const last30DaysTotal = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    res.json({
      totalAmount,
      expenseCount: expenses.length,
      last30DaysTotal,
      last30DaysCount: recentExpenses.length,
      byCategory,
      byMonth,
      averageExpense: expenses.length > 0 ? totalAmount / expenses.length : 0
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    if (!category || !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const Expense = getExpense();
    const expense = new Expense({
      user: req.user,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      date: date ? new Date(date) : Date.now(),
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    // Validation
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
    }
    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }
    if (description !== undefined && description.trim().length === 0) {
      return res.status(400).json({ message: 'Description cannot be empty' });
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description.trim();
    if (date) updateData.date = new Date(date);

    const Expense = getExpense();
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      updateData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const Expense = getExpense();
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expenses by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` });
    }

    const Expense = getExpense();
    const expenses = await Expense.find({ user: req.user, category }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses by category:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;