const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  coverLetter: { type: String, trim: true, maxlength: 4000, default: '' },
  status: { type: String, enum: ['Applied', 'Reviewing', 'Interview', 'Rejected', 'Hired'], default: 'Applied' },
}, { timestamps: true });

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);
