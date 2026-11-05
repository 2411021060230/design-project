// models/Mission.js
// A real-world task a teacher assigns to one class (for example "Plant a sapling").
const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema(
  {
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    xpReward: { type: Number, required: true, min: 5, max: 200 },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mission', missionSchema);
