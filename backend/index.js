console.log('🚀 STARTING NODE PROCESS');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

// Load environment variables
dotenv.config();

console.log('🔧 Starting FinAdvisor Backend...');
console.log('📡 MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');

// Initialize Express app FIRST before loading mongoose/passport
const app = express();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// SKIP mongoose require for now - causes hang if no internet
// Instead, we'll lazy-load it when needed
// const mongoose = require('mongoose');

// Load passport
console.log('Loading passport...');
const passport = require('passport');
console.log('Loading passport config...');
require('./config/passport');
console.log('✅ Passport config loaded');

// Lazy load mongoose when needed
let mongoose;
const getMongoose = () => {
  if (!mongoose) {
    mongoose = require('mongoose');
  }
  return mongoose;
};

// Middleware
// Check if running in production
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy - required for secure cookies behind Render's reverse proxy
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Get MongoDB URI first (needed for session store)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/finadvisor';

// Configure session middleware with MongoDB store for production
const MongoStore = require('connect-mongo');

const sessionConfig = {
  name: 'finadvisor.sid',
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: false, // Changed to false - don't create session until something stored
  cookie: {
    secure: isProduction, // true in production with HTTPS
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production, 'lax' for development
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    domain: undefined // Let the browser handle the domain
  }
};

// Use MongoDB store in production for session persistence
if (isProduction && mongoURI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: mongoURI,
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'native'
  });
  console.log('✅ Using MongoDB session store');
}

app.use(session(sessionConfig));
console.log('✅ Session middleware configured');
app.use(passport.initialize());
app.use(passport.session());

// Register Routes FIRST (before database connection)
console.log('Loading routes...');
try {
  console.log('Loading auth routes...');
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
  
  console.log('Loading expenses routes...');
  app.use('/api/expenses', require('./routes/expenses'));
  console.log('✅ Expenses routes loaded');
  
  console.log('Loading budget routes...');
  app.use('/api/budgets', require('./routes/budgets'));
  console.log('✅ Budget routes loaded');
  
  console.log('Loading ai routes...');
  app.use('/api/ai', require('./routes/ai'));
  console.log('✅ AI routes loaded');
  
  console.log('✅ All routes registered successfully');
} catch (err) {
  console.error('❌ Error registering routes:', err.message);
  console.error('Stack:', err.stack);
}

// Connect to MongoDB (with timeout) - using lazy-loaded mongoose
console.log('🔗 Attempting MongoDB connection...');
console.log(`📡 Connecting to: ${mongoURI.includes('localhost') ? 'Localhost' : 'Atlas Cluster'}`);

let mongoConnectionPromise;
try {
  const mongoose = getMongoose();
  // Don't wait for connection, just initiate it
  mongoose.connect(mongoURI).catch(err => {
    console.error('⚠️  MongoDB connection error (continuing anyway):', err.message);
  });
  console.log('✅ MongoDB connection initiated');
  mongoConnectionPromise = Promise.resolve();
} catch (err) {
  console.error('❌ Error initiating MongoDB connection:', err.message);
  mongoConnectionPromise = Promise.resolve();
}

// Start server immediately
console.log('Database connection attempt completed, starting server...');
startServer();

// Function to start the server
function startServer() {
  const PORT = process.env.PORT || 5000;
  console.log(`🔄 Attempting to start server on port ${PORT}...`);

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server successfully listening on http://localhost:${PORT}`);
    console.log('📚 API ready for requests');
    console.log(`🔍 Server address: ${server.address()}`);
  });

  server.on('error', (err) => {
    console.error('❌ Server failed to start:', err);
  });

  server.on('listening', () => {
    console.log('✅ Server is now listening for connections');
  });
}
