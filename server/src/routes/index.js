// routes/index.js
// The main API router. Every feature's routes are mounted here under /api.

const express = require('express');
const authRoutes = require('./authRoutes');
const classRoutes = require('./classRoutes');
const challengeRoutes = require('./challengeRoutes');
const lessonRoutes = require('./lessonRoutes');
const missionRoutes = require('./missionRoutes');
const ecoActionRoutes = require('./ecoActionRoutes');
const statsRoutes = require('./statsRoutes');

const router = express.Router();

// Simple check that the API is running: GET /api/health
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Gamified learning API is running.' });
});

router.use('/auth', authRoutes);
router.use('/classes', classRoutes);
router.use('/challenges', challengeRoutes);
router.use('/lessons', lessonRoutes);
router.use('/missions', missionRoutes);
router.use('/eco-actions', ecoActionRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
