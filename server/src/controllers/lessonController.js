// controllers/lessonController.js
// List lessons, open one, and mark it complete (students earn XP once per lesson).

const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { requireObjectId, requireOneOf, requireInteger } = require('../utils/validators');
const { awardXp, checkBadges, levelInfo } = require('../services/gamification');

// GET /api/lessons?subject=Physics&grade=9
async function listLessons(req, res) {
  const filter = {};
  if (req.query.subject) filter.subject = requireOneOf(req.query.subject, Challenge.SUBJECTS, 'Subject');
  if (req.query.grade) filter.grade = requireInteger(Number(req.query.grade), 'Grade', { min: 8, max: 10 });

  const lessons = await Lesson.find(filter).sort({ grade: 1, subject: 1, order: 1 }).select('-blocks');
  const done = await LessonProgress.find({
    student: req.user._id,
    lesson: mongoose.trusted({ $in: lessons.map((l) => l._id) }),
  }).select('lesson');
  const doneIds = new Set(done.map((d) => String(d.lesson)));

  res.json({
    success: true,
    data: {
      subjects: Challenge.SUBJECTS,
      lessons: lessons.map((l) => ({
        id: String(l._id),
        subject: l.subject,
        grade: l.grade,
        title: l.title,
        summary: l.summary,
        xpReward: l.xpReward,
        completed: doneIds.has(String(l._id)),
      })),
    },
  });
}

// GET /api/lessons/:id
async function getLesson(req, res) {
  const lesson = await Lesson.findById(requireObjectId(req.params.id, 'Lesson id'));
  if (!lesson) throw new AppError('Lesson not found.', 404);
  const progress = await LessonProgress.exists({ student: req.user._id, lesson: lesson._id });

  res.json({
    success: true,
    data: {
      lesson: {
        id: String(lesson._id),
        subject: lesson.subject,
        grade: lesson.grade,
        title: lesson.title,
        summary: lesson.summary,
        xpReward: lesson.xpReward,
        challengeId: lesson.challenge ? String(lesson.challenge) : null,
        completed: Boolean(progress),
        blocks: lesson.toObject().blocks,
      },
    },
  });
}

// POST /api/lessons/:id/complete  (student)
async function completeLesson(req, res) {
  const lesson = await Lesson.findById(requireObjectId(req.params.id, 'Lesson id'));
  if (!lesson) throw new AppError('Lesson not found.', 404);

  const existing = await LessonProgress.findOne({ student: req.user._id, lesson: lesson._id });
  let xpEarned = 0;
  if (!existing) {
    try {
      await LessonProgress.create({ student: req.user._id, lesson: lesson._id, xpEarned: lesson.xpReward });
      xpEarned = lesson.xpReward;
    } catch (error) {
      if (error.code !== 11000) throw error; // 11000 = completed twice at the same moment, ignore
    }
  }
  await awardXp(req.user._id, xpEarned);
  const newBadges = await checkBadges(req.user._id);
  const user = await User.findById(req.user._id);

  res.json({ success: true, data: { xpEarned, newBadges, totalXp: user.xp, ...levelInfo(user.xp) } });
}

module.exports = { listLessons, getLesson, completeLesson };
