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
console.log('✅ Modules loaded');

// Lazy load mongoose when needed
let mongoose;
const getMongoose = () => {
  if (!mongoose) {
    mongoose = require('mongoose');
  }
  return mongoose;
};

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Get MongoDB URI first (needed for session store)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/finadvisor';

// Configure session middleware - use memory store for now (can switch to MongoDB after connection)
app.use(session({
  name: 'finadvisor.sid',
  secret: process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  // store: MongoStore.create({ mongoUrl: mongoURI }), // Skip for now - causes hang if DB not available
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax', // 'lax' for OAuth redirects
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  }
}));
console.log('✅ Session middleware configured (memory store)');
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB (with timeout) - using lazy-loaded mongoose
console.log('🔗 Attempting MongoDB connection...');
console.log(`📡 Connecting to: ${mongoURI.includes('localhost') ? 'Localhost' : 'Atlas Cluster'}`);

let mongoConnectionPromise;
try {
  const mongooseModule = getMongoose();
  mongoConnectionPromise = mongooseModule.connect(mongoURI, {
    serverSelectionTimeoutMS: 3000, // Fail after 3 seconds if cannot connect
    socketTimeoutMS: 5000,
    family: 4, // Use IPv4, skip IPv6
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database: finadvisor');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.cause) console.error('Error Cause:', err.cause);
    console.log('⚠️  Continuing without database connection for testing...');
    // Don't re-throw, just continue
  });
} catch (err) {
  console.error('❌ Error initiating MongoDB connection:', err.message);
  mongoConnectionPromise = Promise.resolve();
}

// Set a timeout to ensure we start the server even if DB is taking too long
const startupTimeout = setTimeout(() => {
  console.log('⏱️  Startup timeout reached, proceeding with server start...');
  startServer();
}, 5000);

// Routes
console.log('Loading AI routes module...');
const aiRoutes = require('./routes/ai');
console.log('AI routes loaded, type:', typeof aiRoutes);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/ai', aiRoutes);
console.log('All routes registered successfully');

console.log('✅ Routes registered successfully');

// Function to start the server
function startServer() {
  clearTimeout(startupTimeout);
  
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

// Start server when DB connection succeeds or on timeout
mongoConnectionPromise.finally(() => {
  console.log('Database connection attempt completed, starting server...');
  clearTimeout(startupTimeout);
  startServer();
});