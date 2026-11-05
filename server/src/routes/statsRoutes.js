// routes/statsRoutes.js
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const c = require('../controllers/statsController');

const router = express.Router();
router.use(authenticate);

router.get('/me', requireRole('student'), c.myStats); // GET /api/stats/me
router.get('/leaderboard', c.leaderboard); // GET /api/stats/leaderboard

module.exports = router;
