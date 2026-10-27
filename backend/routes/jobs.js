const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const JobReport = require('../models/JobReport');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = authMiddleware;
const connectDatabase = require('../db');

const router = express.Router();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res) => {
  try {
    await connectDatabase();
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(30, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const filter = { $and: [
      { $or: [{ status: 'Open' }, { status: { $exists: false } }] },
      { $or: [{ deadline: null }, { deadline: { $exists: false } }, { deadline: { $gt: new Date() } }] },
    ] };
    const keyword = String(req.query.keyword || '').trim().slice(0, 100);
    const location = String(req.query.location || '').trim().slice(0, 100);
    const type = String(req.query.type || '').trim();
    const workMode = String(req.query.workMode || '').trim();
    const experienceLevel = String(req.query.experienceLevel || '').trim();
    const minSalary = Number(req.query.minSalary);
    const maxSalary = Number(req.query.maxSalary);

    if (keyword) {
      const term = new RegExp(escapeRegex(keyword), 'i');
      filter.$and.push({ $or: [{ title: term }, { company: term }, { description: term }, { location: term }] });
    }
    if (location) filter.location = new RegExp(escapeRegex(location), 'i');
    if (['Full-time', 'Part-time', 'Internship', 'Contract'].includes(type)) filter.type = type;
    if (['On-site', 'Hybrid', 'Remote'].includes(workMode)) filter.workMode = workMode;
    if (['Entry-level', 'Mid-level', 'Senior'].includes(experienceLevel)) filter.experienceLevel = experienceLevel;
    if (Number.isFinite(minSalary) && minSalary > 0) filter.salaryMax = { $gte: minSalary };
    if (Number.isFinite(maxSalary) && maxSalary > 0) filter.salaryMin = { $lte: maxSalary };

    const [total, jobs] = await Promise.all([
      Job.countDocuments(filter),
      Job.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);
    return res.json({ jobs, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error('Jobs list error:', error.message);
    return res.status(503).json({ message: 'Jobs are temporarily unavailable.' });
  }
});

router.get('/mine', authMiddleware, requireRole('Recruiter', 'Admin'), async (req, res) => {
  try {
    const jobs = await Job.find(req.user.role === 'Admin' ? {} : { createdBy: req.user.userId })
      .sort({ createdAt: -1 }).lean();
    const counts = await Application.aggregate([
      { $match: { job: { $in: jobs.map((job) => job._id) } } },
      { $group: { _id: '$job', total: { $sum: 1 } } },
    ]);
    const countByJob = new Map(counts.map((item) => [item._id.toString(), item.total]));
    return res.json(jobs.map((job) => ({ ...job, applicationCount: countByJob.get(job._id.toString()) || 0 })));
  } catch (error) {
    return res.status(500).json({ message: 'Could not load your jobs.' });
  }
});

router.get('/:id/applications', authMiddleware, requireRole('Recruiter', 'Admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).select('createdBy');
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (req.user.role !== 'Admin' && job.createdBy?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only review applicants for your own jobs.' });
    }
    const applications = await Application.find({ job: job._id })
      .populate('candidate', 'name email profile')
      .sort({ createdAt: -1 }).lean();
    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load applicants.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await connectDatabase();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    const job = await Job.findById(req.params.id).lean();
    if (!job || job.status === 'Closed' || (job.deadline && new Date(job.deadline) <= new Date())) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    return res.json(job);
  } catch (error) {
    return res.status(503).json({ message: 'Could not load this job.' });
  }
});

router.post('/', authMiddleware, requireRole('Recruiter', 'Admin'), async (req, res) => {
  try {
    const { title, company, location, type, workMode, experienceLevel, salary, salaryMin, salaryMax, description, deadline, companyLogo } = req.body;
    if (![title, company, location, type, description].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Title, company, location, type and description are required.' });
    }
    const job = await Job.create({
      title: title.trim(), company: company.trim(), location: location.trim(), type,
      workMode, experienceLevel, salary: typeof salary === 'string' ? salary.trim() : '',
      salaryMin: Number.isFinite(Number(salaryMin)) && salaryMin !== '' ? Number(salaryMin) : null,
      salaryMax: Number.isFinite(Number(salaryMax)) && salaryMax !== '' ? Number(salaryMax) : null,
      description: description.trim(), deadline: deadline || null,
      companyLogo: typeof companyLogo === 'string' ? companyLogo.trim() : '',
      createdBy: req.user.userId,
    });
    return res.status(201).json(job);
  } catch (error) {
    return res.status(400).json({ message: 'Could not create job. Check the job details.' });
  }
});

router.patch('/:id', authMiddleware, requireRole('Recruiter', 'Admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (req.user.role !== 'Admin' && job.createdBy?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own jobs.' });
    }
    const fields = ['title', 'company', 'location', 'type', 'workMode', 'experienceLevel', 'salary', 'salaryMin', 'salaryMax', 'description', 'deadline', 'companyLogo', 'status'];
    for (const field of fields) {
      if (Object.hasOwn(req.body, field)) job[field] = req.body[field];
    }
    await job.save();
    return res.json(job);
  } catch (error) {
    return res.status(400).json({ message: 'Could not update this job.' });
  }
});

router.delete('/:id', authMiddleware, requireRole('Recruiter', 'Admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (req.user.role !== 'Admin' && job.createdBy?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only close your own jobs.' });
    }
    job.status = 'Closed';
    await job.save();
    return res.json({ message: 'Job closed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not close this job.' });
  }
});

router.post('/:id/applications', authMiddleware, requireRole('Candidate'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.status === 'Closed' || (job.deadline && new Date(job.deadline) <= new Date())) {
      return res.status(404).json({ message: 'This job is no longer available.' });
    }
    const application = await Application.create({
      job: job._id,
      candidate: req.user.userId,
      coverLetter: typeof req.body.coverLetter === 'string' ? req.body.coverLetter.trim() : '',
    });
    return res.status(201).json({ message: 'Application submitted successfully.', application });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already applied to this job.' });
    return res.status(500).json({ message: 'Could not submit your application.' });
  }
});

router.post('/:id/report', authMiddleware, async (req, res) => {
  try {
    const { reason, details = '' } = req.body;
    const allowed = ['Expired or incorrect', 'Spam or scam', 'Discriminatory', 'Other'];
    if (!allowed.includes(reason)) return res.status(400).json({ message: 'Choose a valid report reason.' });
    const job = await Job.findById(req.params.id).select('_id');
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    const report = await JobReport.create({ job: job._id, reporter: req.user.userId, reason, details });
    return res.status(201).json({ message: 'Thank you. Our team will review this listing.', reportId: report._id });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already reported this job.' });
    return res.status(500).json({ message: 'Could not submit this report.' });
  }
});

module.exports = router;
