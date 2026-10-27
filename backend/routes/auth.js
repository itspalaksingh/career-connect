
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const { rateLimit } = require('express-rate-limit');
const User = require('../models/user');
const connectDatabase = require('../db');
const sendEmail = require('../services/email');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});

function makeToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: crypto.createHash('sha256').update(token).digest('hex') };
}

function appUrl(path) {
  const base = (process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return `${base}${path}`;
}

function requireAuthDatabase(req, res, next) {
  connectDatabase()
    .then(() => next())
    .catch((error) => {
      console.error('Authentication database error:', error.message);
      res.status(503).json({
        message: 'Authentication service is temporarily unavailable.',
      });
    });
}

// Signup API
router.post('/signup', authLimiter, requireAuthDatabase, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required.',
      });
    }

    if (typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string') {
      return res.status(400).json({
        message: 'Invalid input.',
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: 'Password must be 8–72 characters long.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please enter a valid email.',
      });
    }

    if (name.trim().length === 0 || name.trim().length > 100) {
      return res.status(400).json({
        message: 'Please enter a valid name.',
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'This email is already registered.',
      });
    }

    if (role && role !== 'Candidate') {
      return res.status(403).json({ message: 'New accounts start as Candidate. Recruiter access needs admin approval.' });
    }
    const userRole = 'Candidate';

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationEnabled = Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
    const verification = verificationEnabled ? makeToken() : null;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      emailVerified: !verificationEnabled,
      ...(verification ? {
        emailVerificationTokenHash: verification.hash,
        emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      } : {}),
    });

    if (verification) {
      await sendEmail({
        to: user.email,
        subject: 'Verify your CareerConnect email',
        html: `<p>Welcome to CareerConnect, ${user.name.replace(/[<>]/g, '')}.</p><p><a href="${appUrl(`/verify-email?token=${verification.token}`)}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
      });
    }

    return res.status(201).json({
      message: verification
        ? 'Account created. Check your email to verify it before logging in.'
        : 'Account created successfully! You can now log in.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This email is already registered.',
      });
    }

    console.error('Signup error:', error.message);

    if (error.code === 'EMAIL_NOT_CONFIGURED') {
      return res.status(503).json({ message: 'Email delivery is not configured. Please try again later.' });
    }

    return res.status(500).json({
      message: 'Something went wrong. Please try again.',
    });
  }
});

router.post('/verify-email', authLimiter, requireAuthDatabase, async (req, res) => {
  try {
    const token = typeof req.body.token === 'string' ? req.body.token : '';
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationTokenHash: hash,
      emailVerificationExpiresAt: { $gt: new Date() },
    }).select('+emailVerificationTokenHash +emailVerificationExpiresAt');
    if (!user) return res.status(400).json({ message: 'This verification link is invalid or expired.' });
    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();
    return res.json({ message: 'Email verified. You can now log in.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not verify your email.' });
  }
});

router.post('/verification/resend', authLimiter, requireAuthDatabase, async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const user = await User.findOne({ email }).select('+emailVerificationTokenHash +emailVerificationExpiresAt');
    if (user && !user.emailVerified) {
      const verification = makeToken();
      user.emailVerificationTokenHash = verification.hash;
      user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      await sendEmail({
        to: user.email,
        subject: 'Verify your CareerConnect email',
        html: `<p><a href="${appUrl(`/verify-email?token=${verification.token}`)}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
      });
    }
    return res.json({ message: 'If verification is needed, a new link has been sent.' });
  } catch (error) {
    return res.status(error.code === 'EMAIL_NOT_CONFIGURED' ? 503 : 500).json({
      message: error.code === 'EMAIL_NOT_CONFIGURED' ? 'Email delivery is not configured.' : 'Could not resend the verification email.',
    });
  }
});

router.post('/forgot-password', authLimiter, requireAuthDatabase, async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (user) {
      const reset = makeToken();
      user.passwordResetTokenHash = reset.hash;
      user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      await sendEmail({
        to: user.email,
        subject: 'Reset your CareerConnect password',
        html: `<p><a href="${appUrl(`/reset-password?token=${reset.token}`)}">Reset your password</a></p><p>This link expires in 30 minutes. If you did not request this, ignore this email.</p>`,
      });
    }
    return res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (error) {
    return res.status(error.code === 'EMAIL_NOT_CONFIGURED' ? 503 : 500).json({
      message: error.code === 'EMAIL_NOT_CONFIGURED' ? 'Password reset email is not configured.' : 'Could not request a password reset.',
    });
  }
});

router.post('/reset-password', authLimiter, requireAuthDatabase, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== 'string' || typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: 'Use a valid reset link and a password between 8 and 72 characters.' });
    }
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetTokenHash: hash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt +password');
    if (!user) return res.status(400).json({ message: 'This reset link is invalid or expired.' });
    user.password = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    return res.json({ message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not reset your password.' });
  }
});

router.post('/login', authLimiter, requireAuthDatabase, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Please enter your email and password.',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const jwt = require('jsonwebtoken');

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Server authentication is not configured.',
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: req.body.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Something went wrong. Please try again.',
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
