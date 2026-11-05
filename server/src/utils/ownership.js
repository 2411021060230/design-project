// utils/ownership.js
// Shared check: "does this class exist and belong to this teacher?"
const ClassRoom = require('../models/ClassRoom');
const AppError = require('./AppError');

async function getTeacherClass(classId, teacherId) {
  const classRoom = await ClassRoom.findById(classId);
  if (!classRoom) throw new AppError('Class not found.', 404);
  if (String(classRoom.teacher) !== String(teacherId)) {
    throw new AppError('This class belongs to another teacher.', 403);
  }
  return classRoom;
}

module.exports = { getTeacherClass };
