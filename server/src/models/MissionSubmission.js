// models/MissionSubmission.js
// A student's report that they completed a mission. The teacher approves or rejects it.
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    mission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, default: '', trim: true, maxlength: 500 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

submissionSchema.index({ mission: 1, student: 1 }, { unique: true }); // one submission per student per mission

module.exports = mongoose.model('MissionSubmission', submissionSchema);
