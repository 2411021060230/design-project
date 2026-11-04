// models/ClassRoom.js
// A class created by a teacher. Students join with the short join code.
const mongoose = require('mongoose');

const classRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    joinCode: { type: String, required: true, unique: true, uppercase: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

classRoomSchema.index({ students: 1 }); // quick lookup of "which classes is this student in?"

module.exports = mongoose.model('ClassRoom', classRoomSchema);
