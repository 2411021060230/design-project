// routes/lessonRoutes.js
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const c = require('../controllers/lessonController');

const router = express.Router();
router.use(authenticate);

router.get('/', c.listLessons); // GET  /api/lessons
router.get('/:id', c.getLesson); // GET  /api/lessons/:id
router.post('/:id/complete', requireRole('student'), c.completeLesson); // POST /api/lessons/:id/complete

module.exports = router;
