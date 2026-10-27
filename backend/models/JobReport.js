const mongoose = require('mongoose');

const jobReportSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, enum: ['Expired or incorrect', 'Spam or scam', 'Discriminatory', 'Other'] },
  details: { type: String, trim: true, maxlength: 1500, default: '' },
  status: { type: String, enum: ['Open', 'Reviewed', 'Dismissed'], default: 'Open' },
}, { timestamps: true });

jobReportSchema.index({ job: 1, reporter: 1 }, { unique: true });

module.exports = mongoose.models.JobReport || mongoose.model('JobReport', jobReportSchema);
