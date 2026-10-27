const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = authMiddleware;

const router = express.Router();
router.use(authMiddleware);

router.get('/mine', requireRole('Candidate'), async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.userId })
      .populate('job')
      .sort({ createdAt: -1 }).lean();
    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load your applications.' });
  }
});

router.patch('/:id/status', requireRole('Recruiter', 'Admin'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'createdBy');
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    if (req.user.role !== 'Admin' && application.job.createdBy?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update applicants for your own jobs.' });
    }
    const allowed = ['Reviewing', 'Interview', 'Rejected', 'Hired'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid application status.' });
    application.status = req.body.status;
    await application.save();
    return res.json({ message: 'Application status updated.', application });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update this application.' });
  }
});

module.exports = router;
