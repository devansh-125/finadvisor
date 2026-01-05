const express = require('express');
const passport = require('passport');
const getUser = () => require('../models/User')();
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
  (req, res, next) => {
    console.log('🔵 Google OAuth callback received');
    console.log('Query params:', req.query);
    console.log('Session ID:', req.sessionID);
    console.log('Has session:', !!req.session);
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173/login?error=auth_failed',
    session: true
  }),
  (req, res) => {
    // passport.authenticate already calls req.login() automatically on success
    console.log('✅ Passport authentication successful');
    console.log('User ID:', req.user?._id);
    console.log('User Email:', req.user?.email);
    console.log('Session ID:', req.sessionID);
    console.log('Is authenticated:', req.isAuthenticated());
    console.log('Session passport user:', req.session?.passport?.user);
    
    if (!req.user) {
      console.error('❌ No user found after authentication');
      return res.redirect('http://localhost:5173/login?error=no_user');
    }

    if (!req.isAuthenticated()) {
      console.error('❌ User not authenticated after passport.authenticate');
      return res.redirect('http://localhost:5173/login?error=not_authenticated');
    }

    // Ensure session is persisted
    req.session.userId = req.user._id.toString();
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.redirect('http://localhost:5173/login?error=session_error');
      }
      
      console.log('✅ Session saved successfully');
      console.log('Session ID:', req.sessionID);
      console.log('Session passport user:', req.session.passport?.user);
      console.log('Session cookie config:', {
        maxAge: req.session.cookie.maxAge,
        httpOnly: req.session.cookie.httpOnly,
        secure: req.session.cookie.secure,
        sameSite: req.session.cookie.sameSite,
        path: req.session.cookie.path,
        domain: req.session.cookie.domain
      });
      
      const redirectUrl = 'http://localhost:5173/dashboard?user=' + req.user._id;
      console.log('🔄 Redirecting to:', redirectUrl);
      
      // Check if cookie will be set
      const cookieHeader = res.getHeader('Set-Cookie');
      console.log('🍪 Set-Cookie header:', cookieHeader);
      
      res.redirect(redirectUrl);
    });
  }
);

// Get current user
router.get('/user', (req, res) => {
  console.log('🔍 GET /user called');
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('req.user:', req.user);
  console.log('req.isAuthenticated():', req.isAuthenticated());
  console.log('Cookies:', req.headers.cookie);
  
  if (req.user) {
    console.log('✅ User found, sending user data');
    res.json(req.user);
  } else {
    console.log('❌ No user found, returning 401');
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const User = getUser();
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

    const User = getUser();
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