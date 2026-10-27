const jwt = require('jsonwebtoken');
const User = require('../models/user');
const connectDatabase = require('../db');

async function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({
      message: 'Please log in first.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      message: 'Session expired. Please log in again.',
    });
  }

  try {
    await connectDatabase();
    const user = await User.findById(decoded.userId).select('name email role emailVerified');

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before continuing.' });
    }

    req.user = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch {
    return res.status(503).json({ message: 'Authentication service is temporarily unavailable.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
