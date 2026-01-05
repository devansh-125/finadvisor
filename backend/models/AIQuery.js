const mongoose = require('mongoose');

const aiQuerySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'New Chat',
  },
  question: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

let AIQuery;

module.exports = () => {
  if (!AIQuery) {
    AIQuery = mongoose.model('AIQuery', aiQuerySchema);
  }
  return AIQuery;
};