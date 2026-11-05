// models/Attempt.js
// One try at a challenge by a student. XP is only given for improvement, so retrying cannot farm XP.
const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    score: { type: Number, required: true, min: 0 }, // correct answers
    total: { type: Number, required: true, min: 1 }, // number of questions
    perfect: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0, min: 0 },
    answers: [Number],
  },
  { timestamps: true }
);

attemptSchema.index({ student: 1, challenge: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
