// middleware/auth.js
// Two guards used by the routes:
//   authenticate        -> "Who are you?"  Checks the login token and loads the user.
//   requireRole(...)    -> "Are you allowed?"  Checks the user's role (student or teacher).
// Role checks happen on the server. The browser hiding a menu item is never enough.

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { COOKIE_NAME } = require('../utils/token');

const SESSION_EXPIRED_MESSAGE = 'Your session has expired or is invalid. Please log in again.';

// Looks for the token in the cookie first (browser), then in the Authorization header (Postman)
function getTokenFromRequest(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }
  return null;
}

async function authenticate(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    throw new AppError('You need to log in to do that.', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch (error) {
    throw new AppError(SESSION_EXPIRED_MESSAGE, 401);
  }

  // Load the user from the database on every request, so that:
  //  - a deleted account stops working straight away
  //  - the role always comes from the database
  //  - logging out (which changes tokenVersion) makes old tokens useless
  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user || (user.tokenVersion ?? 0) !== payload.tv) {
    throw new AppError(SESSION_EXPIRED_MESSAGE, 401);
  }

  req.user = user;
  next();
}

// Use after authenticate. Example: router.get('/x', authenticate, requireRole('teacher'), handler)
function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      throw new AppError('You need to log in to do that.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Your account does not have permission to do that.', 403);
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
