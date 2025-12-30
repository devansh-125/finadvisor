const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');

// Load environment variables
dotenv.config();
require('./config/passport');

console.log('🔧 Starting FinAdvisor Backend...');
console.log('📡 MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
console.log('🔗 Attempting MongoDB connection...');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finadvisor')
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  console.log('📊 Database: finadvisor');
})
.catch(err => {
  console.error('❌ MongoDB connection failed!');
  console.error('Error:', err.message);
});

// Routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('📚 API ready for requests\n');
});