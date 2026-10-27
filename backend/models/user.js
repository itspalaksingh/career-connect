
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['Candidate', 'Recruiter', 'Admin'],
      default: 'Candidate',
    },
    recruiterRequestStatus: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
    emailVerified: { type: Boolean, default: true },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    profile: {
      headline: { type: String, trim: true, maxlength: 120, default: '' },
      location: { type: String, trim: true, maxlength: 120, default: '' },
      bio: { type: String, trim: true, maxlength: 1200, default: '' },
      skills: { type: [String], default: [] },
      experienceYears: { type: Number, min: 0, max: 60, default: 0 },
      resumeUrl: { type: String, trim: true, maxlength: 500, default: '' },
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.User || mongoose.model('User', userSchema);
