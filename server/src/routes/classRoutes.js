// routes/classRoutes.js
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const c = require('../controllers/classController');

const router = express.Router();
router.use(authenticate); // every class route needs login

router.post('/', requireRole('teacher'), c.createClass); // POST /api/classes
router.get('/', c.listClasses); // GET  /api/classes
router.post('/join', requireRole('student'), c.joinClass); // POST /api/classes/join
router.get('/:id/analytics', requireRole('teacher'), c.classAnalytics); // GET /api/classes/:id/analytics
router.get('/:id/leaderboard', c.classLeaderboard); // GET /api/classes/:id/leaderboard

module.exports = router;
