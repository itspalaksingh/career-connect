const mongoose = require('mongoose');

const loginEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    role: { type: String, enum: ['Candidate', 'Recruiter', 'Admin'], required: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

loginEventSchema.index({ createdAt: -1 });
loginEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.LoginEvent || mongoose.model('LoginEvent', loginEventSchema);
