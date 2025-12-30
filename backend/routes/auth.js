const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Google OAuth login
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    // Successful authentication, redirect home
    console.log('Authentication successful, user:', req.user._id);
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('http://localhost:5173/login');
      }
      res.redirect('http://localhost:5173/dashboard?user=' + req.user._id);
    });
  }
);

// Get current user
router.get('/user', (req, res) => {
  console.log('GET /user, req.user:', req.user);
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.redirect('http://localhost:5173/login');
  });
});

module.exports = router;