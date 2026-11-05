// routes/missionRoutes.js
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const c = require('../controllers/missionController');

const router = express.Router();
router.use(authenticate);

router.post('/', requireRole('teacher'), c.createMission); // POST  /api/missions
router.get('/', c.listMissions); // GET   /api/missions
router.patch('/submissions/:submissionId/review', requireRole('teacher'), c.reviewSubmission);
router.post('/:id/submit', requireRole('student'), c.submitMission); // POST  /api/missions/:id/submit
router.get('/:id/submissions', requireRole('teacher'), c.listSubmissions); // GET   /api/missions/:id/submissions

module.exports = router;
