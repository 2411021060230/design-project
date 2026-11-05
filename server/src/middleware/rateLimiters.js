// middleware/rateLimiters.js
// Limits how often one IP address can try to log in or sign up.
// This slows down password-guessing attacks.

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // failed attempts allowed per IP in the window
  // Successful logins do not count, so many students on one school Wi-Fi are not blocked
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this network. Please wait 15 minutes and try again.',
  },
});

module.exports = { authLimiter };
