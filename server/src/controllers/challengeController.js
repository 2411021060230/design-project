// controllers/challengeController.js
// List challenges, play them (grading happens on the server), and let teachers add new ones.

const Challenge = require('../models/Challenge');
const Attempt = require('../models/Attempt');
const AppError = require('../utils/AppError');
const { requireString, requireObjectId, requireOneOf, requireInteger } = require('../utils/validators');
const { awardXp, checkBadges, levelInfo } = require('../services/gamification');
const User = require('../models/User');

// GET /api/challenges?subject=Water
async function listChallenges(req, res) {
  const filter = { isActive: true };
  if (req.query.grade) {
    filter.grade = requireInteger(Number(req.query.grade), 'Grade', { min: 8, max: 10 });
  }
  if (req.query.subject) {
    filter.subject = requireOneOf(req.query.subject, Challenge.SUBJECTS, 'Subject');
  }
  const challenges = await Challenge.find(filter).sort({ grade: 1, subject: 1, createdAt: 1 });

  // Best score per challenge for this user (empty for teachers)
  const best = await Attempt.aggregate([
    { $match: { student: req.user._id } },
    { $group: { _id: '$challenge', bestPercent: { $max: { $multiply: [{ $divide: ['$score', '$total'] }, 100] } } } },
  ]);
  const bestById = new Map(best.map((row) => [String(row._id), Math.round(row.bestPercent)]));

  const data = challenges.map((c) => ({
    id: String(c._id),
    subject: c.subject,
    grade: c.grade,
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    xpReward: c.xpReward,
    questionCount: c.questions.length,
    bestPercent: bestById.get(String(c._id)) ?? null,
  }));
  res.json({ success: true, data: { challenges: data, subjects: Challenge.SUBJECTS } });
}

// GET /api/challenges/:id  (answers are NOT sent, so students cannot read them in the browser)
async function getChallenge(req, res) {
  const id = requireObjectId(req.params.id, 'Challenge id');
  const c = await Challenge.findOne({ _id: id, isActive: true });
  if (!c) throw new AppError('Challenge not found.', 404);

  res.json({
    success: true,
    data: {
      challenge: {
        id: String(c._id),
        subject: c.subject,
        grade: c.grade,
        title: c.title,
        description: c.description,
        difficulty: c.difficulty,
        xpReward: c.xpReward,
        questions: c.questions.map((q) => ({ text: q.text, options: q.options })),
      },
    },
  });
}

// POST /api/challenges/:id/attempt  (student)  body: { answers: [1, 0, 2, ...] }
async function submitAttempt(req, res) {
  const id = requireObjectId(req.params.id, 'Challenge id');
  const challenge = await Challenge.findOne({ _id: id, isActive: true });
  if (!challenge) throw new AppError('Challenge not found.', 404);

  const answers = req.body?.answers;
  if (!Array.isArray(answers) || answers.length !== challenge.questions.length) {
    throw new AppError(`Send one answer for each of the ${challenge.questions.length} questions.`, 400);
  }

  // Grade on the server
  let score = 0;
  const review = challenge.questions.map((q, i) => {
    const picked = requireInteger(answers[i], `Answer ${i + 1}`, { min: 0, max: q.options.length - 1 });
    const isCorrect = picked === q.correctIndex;
    if (isCorrect) score += 1;
    return { yourIndex: picked, correctIndex: q.correctIndex, isCorrect, explanation: q.explanation };
  });
  const total = challenge.questions.length;

  // XP rule: you can earn up to xpReward per challenge in total.
  // Retrying only gives the extra XP for improving your best result.
  const [previous] = await Attempt.aggregate([
    { $match: { student: req.user._id, challenge: challenge._id } },
    { $group: { _id: null, awarded: { $sum: '$xpEarned' } } },
  ]);
  const alreadyAwarded = previous?.awarded || 0;
  const target = Math.round((challenge.xpReward * score) / total);
  const xpEarned = Math.max(0, target - alreadyAwarded);

  await Attempt.create({
    student: req.user._id,
    challenge: challenge._id,
    score,
    total,
    perfect: score === total,
    xpEarned,
    answers,
  });
  await awardXp(req.user._id, xpEarned);
  const newBadges = await checkBadges(req.user._id);
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: { score, total, xpEarned, review, newBadges, totalXp: user.xp, ...levelInfo(user.xp) },
  });
}

// POST /api/challenges  (teacher)
async function createChallenge(req, res) {
  const body = req.body ?? {};
  const subject = requireOneOf(body.subject, Challenge.SUBJECTS, 'Subject');
  const grade = requireInteger(body.grade, 'Grade', { min: 8, max: 10 });
  const difficulty = body.difficulty === undefined ? 'easy' : requireOneOf(body.difficulty, Challenge.DIFFICULTIES, 'Difficulty');
  const title = requireString(body.title, 'Title', { min: 3, max: 100 });
  const description = body.description === undefined ? '' : requireString(body.description, 'Description', { min: 0, max: 300 });
  const xpReward = requireInteger(body.xpReward ?? 50, 'XP reward', { min: 10, max: 200 });

  if (!Array.isArray(body.questions) || body.questions.length < 1 || body.questions.length > 20) {
    throw new AppError('Send between 1 and 20 questions.', 400);
  }
  const questions = body.questions.map((q, i) => {
    const label = `Question ${i + 1}`;
    if (!Array.isArray(q?.options) || q.options.length < 2 || q.options.length > 6) {
      throw new AppError(`${label} needs 2 to 6 options.`, 400);
    }
    return {
      text: requireString(q.text, `${label} text`, { min: 3, max: 300 }),
      options: q.options.map((o, j) => requireString(o, `${label} option ${j + 1}`, { min: 1, max: 150 })),
      correctIndex: requireInteger(q.correctIndex, `${label} correctIndex`, { min: 0, max: q.options.length - 1 }),
      explanation: q.explanation === undefined ? '' : requireString(q.explanation, `${label} explanation`, { min: 0, max: 400 }),
    };
  });

  const challenge = await Challenge.create({ subject, grade, difficulty, title, description, xpReward, questions, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Challenge created.', data: { id: String(challenge._id) } });
}

module.exports = { listChallenges, getChallenge, submitAttempt, createChallenge };
