const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'transport', 'entertainment', 'utilities', 'health', 'education', 'family', 'other'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  period: {
    type: String,
    enum: ['monthly', 'weekly', 'yearly'],
    default: 'monthly',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    // Optional - if not set, budget is ongoing
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  alerts: {
    enabled: {
      type: Boolean,
      default: true,
    },
    thresholds: {
      type: [Number], // e.g., [50, 80, 100] for 50%, 80%, 100% alerts
      default: [80, 100],
    },
  },
  spent: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
budgetSchema.index({ user: 1, category: 1, isActive: 1 });

let Budget;

module.exports = () => {
  if (!Budget) {
    Budget = mongoose.model('Budget', budgetSchema);
  }
  return Budget;
};