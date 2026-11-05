// routes/ecoActionRoutes.js
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const c = require('../controllers/ecoActionController');

const router = express.Router();
router.use(authenticate, requireRole('student'));

router.post('/', c.logAction); // POST /api/eco-actions
router.get('/', c.listActions); // GET  /api/eco-actions

module.exports = router;
