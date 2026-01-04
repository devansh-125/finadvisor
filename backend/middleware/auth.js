const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Check if user is authenticated via Passport session
    if (req.isAuthenticated && req.isAuthenticated()) {
      console.log('✅ User authenticated via Passport session');
      return next();
    }

    // Fallback to JWT token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT verified, userId:', decoded.userId);
      
      // Fetch the full user object
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('❌ User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = user;
      console.log('✅ User object attached to request');
      next();
    } catch (tokenErr) {
      console.log('❌ JWT verification failed:', tokenErr.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (err) {
    console.error('❌ Auth middleware error:', err);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;