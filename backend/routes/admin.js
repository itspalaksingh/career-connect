const express = require('express');
const JobReport = require('../models/JobReport');
const Job = require('../models/Job');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = authMiddleware;

const router = express.Router();
router.use(authMiddleware, requireRole('Admin'));

router.get('/reports', async (req, res) => {
  try {
    const reports = await JobReport.find().populate('job').populate('reporter', 'name email').sort({ createdAt: -1 }).lean();
    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load reports.' });
  }
});

router.get('/recruiter-requests', async (req, res) => {
  try {
    const users = await User.find({ recruiterRequestStatus: 'Pending' }).select('name email profile createdAt').sort({ createdAt: 1 }).lean();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load recruiter requests.' });
  }
});

router.patch('/recruiter-requests/:id', async (req, res) => {
  try {
    if (!['approve', 'reject'].includes(req.body.decision)) {
      return res.status(400).json({ message: 'Choose approve or reject.' });
    }
    const approved = req.body.decision === 'approve';
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: {
        role: approved ? 'Recruiter' : 'Candidate',
        recruiterRequestStatus: approved ? 'Approved' : 'Rejected',
      },
    }, { new: true }).select('name email role recruiterRequestStatus');
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    return res.json({ message: approved ? 'Recruiter access approved.' : 'Request rejected.', user });
  } catch (error) {
    return res.status(500).json({ message: 'Could not process this request.' });
  }
});

router.patch('/reports/:id', async (req, res) => {
  try {
    if (!['Reviewed', 'Dismissed'].includes(req.body.status)) {
      return res.status(400).json({ message: 'Choose Reviewed or Dismissed.' });
    }
    const report = await JobReport.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    return res.json({ message: 'Report updated.', report });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update report.' });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('createdBy', 'name email').sort({ createdAt: -1 }).lean();
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load job moderation queue.' });
  }
});

module.exports = router;
