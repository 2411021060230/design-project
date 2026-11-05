// models/Lesson.js
// An interactive lesson: a list of "blocks" shown one after another.
//   text   - an explanation (title + body)
//   sim    - an interactive simulation, chosen by key (e.g. 'ohm', 'ph', 'cell')
//   check  - a quick question with instant feedback
//   reveal - "think about it" prompt with a hidden answer
const mongoose = require('mongoose');
const Challenge = require('./Challenge');

const blockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['text', 'sim', 'check', 'reveal'], required: true },
    title: String,
    body: String,
    sim: String,
    question: String,
    options: [String],
    correctIndex: Number,
    explanation: String,
    prompt: String,
    answer: String,
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    subject: { type: String, enum: Challenge.SUBJECTS, required: true },
    grade: { type: Number, enum: Challenge.GRADES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    summary: { type: String, default: '', maxlength: 300 },
    order: { type: Number, default: 1 },
    xpReward: { type: Number, default: 30, min: 5, max: 100 },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }, // the quiz that goes with this lesson
    blocks: [blockSchema],
    isSeed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

lessonSchema.index({ grade: 1, subject: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
