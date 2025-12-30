const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Check if user is authenticated via Passport session
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // Fallback to JWT token
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token or session, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;