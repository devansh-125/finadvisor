const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

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

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      profile: user.profile
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { age, income, savings, goals, currency } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (user.profile) {
      if (age !== undefined) user.profile.age = age;
      if (income !== undefined) user.profile.income = income;
      if (savings !== undefined) user.profile.savings = savings;
      if (goals !== undefined) user.profile.goals = goals;
      if (currency !== undefined) user.profile.currency = currency;
    }

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      profile: user.profile
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
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