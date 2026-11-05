// models/EcoAction.js
// A real-world eco action logged by a student (planting a tree, recycling, ...).
const mongoose = require('mongoose');

const ecoActionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    note: { type: String, default: '', trim: true, maxlength: 200 },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EcoAction', ecoActionSchema);
