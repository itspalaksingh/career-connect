const express = require('express');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name email role profile recruiterRequestStatus');
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load your profile.' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { headline = '', location = '', bio = '', skills = [], experienceYears = 0, resumeUrl = '' } = req.body;
    if (!Array.isArray(skills) || skills.length > 30 || skills.some((skill) => typeof skill !== 'string' || skill.length > 50)) {
      return res.status(400).json({ message: 'Enter up to 30 valid skills.' });
    }
    if (resumeUrl && !/^https:\/\//i.test(resumeUrl)) {
      return res.status(400).json({ message: 'Resume link must use HTTPS.' });
    }
    const user = await User.findByIdAndUpdate(req.user.userId, {
      $set: {
        profile: {
          headline: String(headline).trim(),
          location: String(location).trim(),
          bio: String(bio).trim(),
          skills: [...new Set(skills.map((skill) => skill.trim()).filter(Boolean))],
          experienceYears: Number(experienceYears) || 0,
          resumeUrl: String(resumeUrl).trim(),
        },
      },
    }, { new: true, runValidators: true }).select('name email role profile recruiterRequestStatus');
    return res.json({ message: 'Profile saved.', user });
  } catch (error) {
    return res.status(400).json({ message: 'Could not save your profile.' });
  }
});

router.post('/request-recruiter', async (req, res) => {
  try {
    if (req.user.role !== 'Candidate') {
      return res.status(409).json({ message: 'Only candidate accounts can request recruiter access.' });
    }
    const user = await User.findById(req.user.userId);
    if (user.recruiterRequestStatus === 'Pending') {
      return res.status(409).json({ message: 'Your recruiter access request is already pending.' });
    }
    user.recruiterRequestStatus = 'Pending';
    await user.save();
    return res.status(202).json({ message: 'Recruiter access request sent for admin review.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not submit recruiter request.' });
  }
});

module.exports = router;
