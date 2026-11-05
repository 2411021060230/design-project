// controllers/ecoActionController.js
// Students log real-world eco actions and earn a little XP for each.

const mongoose = require('mongoose');
const EcoAction = require('../models/EcoAction');
const AppError = require('../utils/AppError');
const { requireString, requireOneOf } = require('../utils/validators');
const { awardXp, checkBadges } = require('../services/gamification');

const ECO_ACTIONS = {
  tree_planting: { label: 'Planted a tree', xp: 20 },
  recycling: { label: 'Recycled waste', xp: 10 },
  energy_saving: { label: 'Saved energy', xp: 10 },
  water_saving: { label: 'Saved water', xp: 10 },
  public_transport: { label: 'Used public transport, cycled or walked', xp: 15 },
  cleanup: { label: 'Joined a cleanup drive', xp: 20 },
};
const DAILY_LIMIT = 5; // stops people from farming XP

const catalog = Object.entries(ECO_ACTIONS).map(([type, info]) => ({ type, ...info }));

// POST /api/eco-actions  (student)  body: { type, note }
async function logAction(req, res) {
  const type = requireOneOf(req.body?.type, Object.keys(ECO_ACTIONS), 'Action type');
  const note = req.body?.note === undefined ? '' : requireString(req.body.note, 'Note', { min: 0, max: 200 });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = await EcoAction.countDocuments({
    student: req.user._id,
    createdAt: mongoose.trusted({ $gte: startOfToday }),
  });
  if (today >= DAILY_LIMIT) {
    throw new AppError(`You can log up to ${DAILY_LIMIT} eco actions per day. Come back tomorrow!`, 429);
  }

  const xpEarned = ECO_ACTIONS[type].xp;
  await EcoAction.create({ student: req.user._id, type, note, xpEarned });
  await awardXp(req.user._id, xpEarned);
  const newBadges = await checkBadges(req.user._id);

  res.status(201).json({ success: true, message: `Nice! +${xpEarned} XP`, data: { xpEarned, newBadges } });
}

// GET /api/eco-actions  (student)
async function listActions(req, res) {
  const actions = await EcoAction.find({ student: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({
    success: true,
    data: {
      types: catalog,
      actions: actions.map((a) => ({
        id: String(a._id),
        label: ECO_ACTIONS[a.type]?.label || a.type,
        note: a.note,
        xpEarned: a.xpEarned,
        createdAt: a.createdAt,
      })),
    },
  });
}

module.exports = { logAction, listActions };
