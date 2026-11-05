// models/Challenge.js
// A quiz-style challenge with several multiple-choice questions.
const mongoose = require('mongoose');

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Maths'];
const GRADES = [8, 9, 10]; // school classes
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 300 },
    options: {
      type: [String],
      validate: [(list) => list.length >= 2 && list.length <= 6, 'Each question needs 2 to 6 options'],
    },
    correctIndex: { type: Number, required: true, min: 0 }, // position of the right option (0 = first)
    explanation: { type: String, default: '', maxlength: 400 },
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    subject: { type: String, enum: SUBJECTS, required: true, index: true },
    grade: { type: Number, enum: GRADES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    difficulty: { type: String, enum: DIFFICULTIES, default: 'easy' },
    xpReward: { type: Number, required: true, min: 10, max: 200 }, // XP for a perfect score
    questions: {
      type: [questionSchema],
      validate: [(list) => list.length >= 1 && list.length <= 20, 'A challenge needs 1 to 20 questions'],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    isSeed: { type: Boolean, default: false }, // marks sample data so the seed script can refresh it
  },
  { timestamps: true }
);

const Challenge = mongoose.model('Challenge', challengeSchema);
Challenge.SUBJECTS = SUBJECTS;
Challenge.GRADES = GRADES;
Challenge.DIFFICULTIES = DIFFICULTIES;
module.exports = Challenge;
