const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const Job = require('../models/Job');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: 'savedJobs',
      match: { $or: [{ status: 'Open' }, { status: { $exists: false } }] },
    });
    return res.json(user.savedJobs || []);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load saved jobs.' });
  }
});

router.post('/:jobId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) return res.status(404).json({ message: 'Job not found.' });
    const job = await Job.findOne({
      _id: req.params.jobId,
      $or: [{ status: 'Open' }, { status: { $exists: false } }],
    }).select('_id');
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    await User.updateOne({ _id: req.user.userId }, { $addToSet: { savedJobs: job._id } });
    return res.status(201).json({ message: 'Job saved.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not save this job.' });
  }
});

router.delete('/:jobId', async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.userId }, { $pull: { savedJobs: req.params.jobId } });
    return res.json({ message: 'Job removed from saved jobs.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not remove this saved job.' });
  }
});

module.exports = router;
