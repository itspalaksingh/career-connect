
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { rateLimit } = require('express-rate-limit');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const connectDatabase = require('./db');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const profileRoutes = require('./routes/profile');
const savedJobsRoutes = require('./routes/savedJobs');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()),
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
}));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/saved-jobs', savedJobsRoutes);
app.use('/api/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'CareerConnect backend is running!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CareerConnect API is working!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CareerConnect backend running at http://localhost:${PORT}`);
  });

  connectDatabase()
    .then(() => console.log('MongoDB connected successfully!'))
    .catch((error) => {
      console.error(
        'MongoDB connection failed; database routes will return 503 until it is available:',
        error.message
      );
    });
}

module.exports = app;
