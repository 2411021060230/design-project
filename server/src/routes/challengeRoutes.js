// routes/challengeRoutes.js
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const c = require('../controllers/challengeController');

const router = express.Router();
router.use(authenticate);

router.get('/', c.listChallenges); // GET  /api/challenges
router.post('/', requireRole('teacher'), c.createChallenge); // POST /api/challenges
router.get('/:id', c.getChallenge); // GET  /api/challenges/:id
router.post('/:id/attempt', requireRole('student'), c.submitAttempt); // POST /api/challenges/:id/attempt

module.exports = router;
