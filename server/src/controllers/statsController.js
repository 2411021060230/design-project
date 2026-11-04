// controllers/statsController.js
// Numbers for the student dashboard and the global leaderboard.

const mongoose = require('mongoose');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const EcoAction = require('../models/EcoAction');
const MissionSubmission = require('../models/MissionSubmission');
const LessonProgress = require('../models/LessonProgress');
const { levelInfo, describeBadge } = require('../services/gamification');

// GET /api/stats/me  (student)
async function myStats(req, res) {
  const user = await User.findById(req.user._id);

  const [attemptStats, ecoCount, approvedMissions, recent, lessonsCompleted] = await Promise.all([
    Attempt.aggregate([
      { $match: { student: user._id } },
      { $group: { _id: null, attempts: { $sum: 1 }, avgPercent: { $avg: { $multiply: [{ $divide: ['$score', '$total'] }, 100] } } } },
    ]),
    EcoAction.countDocuments({ student: user._id }),
    MissionSubmission.countDocuments({ student: user._id, status: 'approved' }),
    Attempt.find({ student: user._id }).sort({ createdAt: -1 }).limit(7).populate('challenge', 'title'),
    LessonProgress.countDocuments({ student: user._id }),
  ]);

  res.json({
    success: true,
    data: {
      xp: user.xp,
      ...levelInfo(user.xp),
      badges: user.badges.map(describeBadge),
      attempts: attemptStats[0]?.attempts || 0,
      avgPercent: Math.round(attemptStats[0]?.avgPercent || 0),
      ecoActions: ecoCount,
      approvedMissions,
      lessonsCompleted,
      // Oldest first so the chart reads left to right
      recent: recent.reverse().map((a) => ({
        title: a.challenge?.title || 'Challenge',
        percent: Math.round((a.score / a.total) * 100),
      })),
    },
  });
}

// GET /api/stats/leaderboard
async function leaderboard(req, res) {
  const top = await User.find({ role: 'student' }).sort({ xp: -1 }).limit(10).select('name xp');
  let myRank = null;
  if (req.user.role === 'student') {
    const ahead = await User.countDocuments({ role: 'student', xp: mongoose.trusted({ $gt: req.user.xp }) });
    myRank = ahead + 1;
  }
  res.json({
    success: true,
    data: {
      leaderboard: top.map((u, i) => ({ rank: i + 1, id: String(u._id), name: u.name, xp: u.xp, isMe: String(u._id) === String(req.user._id) })),
      myRank,
    },
  });
}

module.exports = { myStats, leaderboard };
