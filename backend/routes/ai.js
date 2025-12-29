const express = require('express');
const OpenAI = require('openai');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI financial query
router.post('/query', auth, async (req, res) => {
  try {
    const { question } = req.body;

    // Get user's expenses for context
    const expenses = await Expense.find({ user: req.user }).sort({ date: -1 }).limit(50);

    const expenseContext = expenses.map(exp => 
      `${exp.date.toDateString()}: ${exp.category} - $${exp.amount} - ${exp.description}`
    ).join('\n');

    const prompt = `
You are a financial advisor AI. Based on the user's expense history, provide helpful financial advice.

User's recent expenses:
${expenseContext}

User's question: ${question}

Provide a concise, personalized response.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    res.json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI service error' });
  }
});

module.exports = router;