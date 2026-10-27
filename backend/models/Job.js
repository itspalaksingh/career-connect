const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  companyLogo: { type: String, trim: true, maxlength: 500, default: '' },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  type: { type: String, required: true, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'] },
  workMode: { type: String, enum: ['On-site', 'Hybrid', 'Remote'], default: 'On-site' },
  experienceLevel: { type: String, enum: ['Entry-level', 'Mid-level', 'Senior'], default: 'Entry-level' },
  salary: { type: String, trim: true, maxlength: 80, default: '' },
  salaryMin: { type: Number, min: 0, default: null },
  salaryMax: { type: Number, min: 0, default: null },
  description: { type: String, required: true, trim: true, maxlength: 12000 },
  deadline: { type: Date, default: null },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', description: 'text', location: 'text' });

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);
