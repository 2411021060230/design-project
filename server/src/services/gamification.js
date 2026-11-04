// services/gamification.js
// The game rules in one place: levels, XP and badges.

const User = require('../models/User');
const Attempt = require('../models/Attempt');
const EcoAction = require('../models/EcoAction');
const MissionSubmission = require('../models/MissionSubmission');
const LessonProgress = require('../models/LessonProgress');

const XP_PER_LEVEL = 100; // every 100 XP is one level

// Badge codes are saved on the user. Names and descriptions are shown in the website.
const BADGES = {
  first_challenge: { name: 'First Steps', description: 'Finished your first challenge' },
  perfect_score: { name: 'Perfect Score', description: 'Answered every question right in a challenge' },
  quiz_master: { name: 'Quiz Master', description: 'Completed 10 challenge attempts' },
  eco_starter: { name: 'Eco Starter', description: 'Logged your first real-world eco action' },
  eco_hero: { name: 'Eco Hero', description: 'Logged 10 real-world eco actions' },
  mission_complete: { name: 'Mission Complete', description: 'Had a teacher mission approved' },
  first_lesson: { name: 'Curious Mind', description: 'Completed your first lesson' },
  five_lessons: { name: 'Knowledge Seeker', description: 'Completed 5 lessons' },
  rising_star: { name: 'Rising Star', description: 'Reached 500 XP' },
};

function describeBadge(code) {
  return { code, ...(BADGES[code] || { name: code, description: '' }) };
}

// Turns total XP into level information, e.g. 250 XP -> level 3, 50 XP into the level
function levelInfo(xp) {
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xpIntoLevel: xp % XP_PER_LEVEL,
    xpForNextLevel: XP_PER_LEVEL,
  };
}

async function awardXp(userId, amount) {
  if (amount > 0) {
    await User.updateOne({ _id: userId }, { $inc: { xp: amount } });
  }
}

// Looks at the student's history and gives any badges they have newly earned.
// Returns the list of new badges so the website can celebrate them.
async function checkBadges(userId) {
  const user = await User.findById(userId);
  const [attempts, perfectAttempts, ecoActions, approvedMissions, lessonsDone] = await Promise.all([
    Attempt.countDocuments({ student: userId }),
    Attempt.countDocuments({ student: userId, perfect: true }),
    EcoAction.countDocuments({ student: userId }),
    MissionSubmission.countDocuments({ student: userId, status: 'approved' }),
    LessonProgress.countDocuments({ student: userId }),
  ]);

  const earned = [];
  if (attempts >= 1) earned.push('first_challenge');
  if (perfectAttempts >= 1) earned.push('perfect_score');
  if (attempts >= 10) earned.push('quiz_master');
  if (ecoActions >= 1) earned.push('eco_starter');
  if (ecoActions >= 10) earned.push('eco_hero');
  if (approvedMissions >= 1) earned.push('mission_complete');
  if (lessonsDone >= 1) earned.push('first_lesson');
  if (lessonsDone >= 5) earned.push('five_lessons');
  if (user.xp >= 500) earned.push('rising_star');

  const newlyEarned = earned.filter((code) => !user.badges.includes(code));
  if (newlyEarned.length > 0) {
    await User.updateOne({ _id: userId }, { $addToSet: { badges: { $each: newlyEarned } } });
  }
  return newlyEarned.map(describeBadge);
}

module.exports = { XP_PER_LEVEL, BADGES, describeBadge, levelInfo, awardXp, checkBadges };
