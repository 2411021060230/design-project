// routes/authRoutes.js
// Connects each /api/auth URL to a controller function, plus the guards it needs.

const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, register); // POST   /api/auth/register
router.post('/login', authLimiter, login); // POST   /api/auth/login
router.post('/logout', authenticate, logout); // POST   /api/auth/logout
router.get('/me', authenticate, getMe); // GET    /api/auth/me
router.patch('/me', authenticate, updateProfile); // PATCH  /api/auth/me
router.post('/change-password', authenticate, changePassword); // POST   /api/auth/change-password

module.exports = router;
