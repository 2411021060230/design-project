// controllers/classController.js
// Teachers create classes and see analytics. Students join with a code.

const crypto = require('crypto');
const mongoose = require('mongoose');
const ClassRoom = require('../models/ClassRoom');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const Challenge = require('../models/Challenge');
const EcoAction = require('../models/EcoAction');
const AppError = require('../utils/AppError');
const { requireString, requireObjectId } = require('../utils/validators');
const { getTeacherClass } = require('../utils/ownership');
const { levelInfo } = require('../services/gamification');

const round = (n) => Math.round(n || 0);

async function generateJoinCode() {
  for (let i = 0; i < 5; i += 1) {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g. "A1B2C3"
    if (!(await ClassRoom.exists({ joinCode: code }))) return code;
  }
  throw new AppError('Could not create a join code. Please try again.', 500);
}

// POST /api/classes  (teacher)
async function createClass(req, res) {
  const name = requireString(req.body?.name, 'Class name', { min: 2, max: 80 });
  const classRoom = await ClassRoom.create({ name, teacher: req.user._id, joinCode: await generateJoinCode() });
  res.status(201).json({ success: true, message: 'Class created.', data: { classRoom } });
}

// GET /api/classes  (teacher: own classes, student: joined classes)
async function listClasses(req, res) {
  if (req.user.role === 'teacher') {
    const classes = await ClassRoom.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    const data = classes.map((c) => ({
      id: String(c._id),
      name: c.name,
      joinCode: c.joinCode,
      studentCount: c.students.length,
    }));
    return res.json({ success: true, data: { classes: data } });
  }
  // Students do not get the join code in the list
  const classes = await ClassRoom.find({ students: req.user._id }).sort({ createdAt: -1 }).populate('teacher', 'name');
  const data = classes.map((c) => ({
    id: String(c._id),
    name: c.name,
    teacherName: c.teacher?.name || '',
    studentCount: c.students.length,
  }));
  return res.json({ success: true, data: { classes: data } });
}

// POST /api/classes/join  (student)
async function joinClass(req, res) {
  const joinCode = requireString(req.body?.joinCode, 'Join code', { min: 4, max: 12 }).toUpperCase();
  const classRoom = await ClassRoom.findOne({ joinCode });
  if (!classRoom) throw new AppError('No class found with that join code.', 404);

  await ClassRoom.updateOne({ _id: classRoom._id }, { $addToSet: { students: req.user._id } });
  res.json({ success: true, message: `You joined ${classRoom.name}.`, data: { id: String(classRoom._id), name: classRoom.name } });
}

// GET /api/classes/:id/analytics  (teacher who owns the class)
async function classAnalytics(req, res) {
  const classId = requireObjectId(req.params.id, 'Class id');
  const classRoom = await getTeacherClass(classId, req.user._id);
  const ids = [...classRoom.students]; // plain array of ids

  // mongoose.trusted lets us use $in in a query (the app blocks "$" operators by default)
  const students = await User.find({ _id: mongoose.trusted({ $in: ids }) }).select('name email xp');

  const percent = { $multiply: [{ $divide: ['$score', '$total'] }, 100] };
  const [perStudent, perSubject, ecoCounts] = await Promise.all([
    Attempt.aggregate([
      { $match: { student: { $in: ids } } },
      { $group: { _id: '$student', attempts: { $sum: 1 }, avgPercent: { $avg: percent } } },
    ]),
    Attempt.aggregate([
      { $match: { student: { $in: ids } } },
      { $lookup: { from: Challenge.collection.name, localField: 'challenge', foreignField: '_id', as: 'c' } },
      { $unwind: '$c' },
      { $group: { _id: '$c.subject', attempts: { $sum: 1 }, avgPercent: { $avg: percent } } },
      { $sort: { _id: 1 } },
    ]),
    EcoAction.aggregate([
      { $match: { student: { $in: ids } } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]),
  ]);

  const attemptsById = new Map(perStudent.map((row) => [String(row._id), row]));
  const ecoById = new Map(ecoCounts.map((row) => [String(row._id), row.count]));

  const table = students
    .map((s) => {
      const a = attemptsById.get(String(s._id));
      return {
        id: String(s._id),
        name: s.name,
        email: s.email,
        xp: s.xp,
        level: levelInfo(s.xp).level,
        attempts: a?.attempts || 0,
        avgPercent: round(a?.avgPercent),
        ecoActions: ecoById.get(String(s._id)) || 0,
      };
    })
    .sort((x, y) => y.xp - x.xp);

  const totalAttempts = perSubject.reduce((sum, row) => sum + row.attempts, 0);
  const weighted = perSubject.reduce((sum, row) => sum + row.avgPercent * row.attempts, 0);

  res.json({
    success: true,
    data: {
      classRoom: { id: String(classRoom._id), name: classRoom.name, joinCode: classRoom.joinCode },
      summary: {
        studentCount: students.length,
        totalXp: students.reduce((sum, s) => sum + s.xp, 0),
        totalAttempts,
        avgPercent: totalAttempts ? round(weighted / totalAttempts) : 0,
      },
      subjects: perSubject.map((row) => ({ subject: row._id, attempts: row.attempts, avgPercent: round(row.avgPercent) })),
      students: table,
    },
  });
}

// GET /api/classes/:id/leaderboard  (teacher of the class or a student in it)
async function classLeaderboard(req, res) {
  const classId = requireObjectId(req.params.id, 'Class id');
  const classRoom = await ClassRoom.findById(classId);
  if (!classRoom) throw new AppError('Class not found.', 404);

  const isTeacher = String(classRoom.teacher) === String(req.user._id);
  const isMember = classRoom.students.some((id) => String(id) === String(req.user._id));
  if (!isTeacher && !isMember) throw new AppError('You are not part of this class.', 403);

  const top = await User.find({ _id: mongoose.trusted({ $in: [...classRoom.students] }) })
    .sort({ xp: -1 })
    .limit(20)
    .select('name xp');
  res.json({
    success: true,
    data: { leaderboard: top.map((u, i) => ({ rank: i + 1, id: String(u._id), name: u.name, xp: u.xp })) },
  });
}

module.exports = { createClass, listClasses, joinClass, classAnalytics, classLeaderboard };
