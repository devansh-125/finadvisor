console.log('Loading passport config...');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Lazy load User model to avoid circular dependencies
const getUser = () => require('../models/User')();

console.log('Setting up Google OAuth Strategy...');
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Processing Google profile:', profile.id, profile.displayName);
      const User = getUser();
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        console.log('✅ Existing user found:', user._id);
        return done(null, user);
      }

      // Create new user
      console.log('➕ Creating new user...');
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0]?.value,
        profilePicture: profile.photos[0]?.value,
      });

      await user.save();
      console.log('✅ New user created:', user._id);
      return done(null, user);
    } catch (err) {
      console.error('❌ Error in passport strategy:', err);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = getUser();
    const user = await User.findById(id);
    if (!user) {
      console.log('⚠️ User not found during deserialize:', id);
      return done(null, false);
    }
    console.log('✅ User deserialized:', user._id);
    done(null, user);
  } catch (err) {
    console.log('⚠️ Error deserializing user (DB might not be connected):', err.message);
    // Return null instead of error to avoid blocking startup
    done(null, false);
  }
});

console.log('✅ Passport config loaded');
module.exports = passport;