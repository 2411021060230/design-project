// controllers/authController.js
// Handles account creation, login, logout, profile and password changes.
// Controllers hold the business rules. Routes only connect URLs to these functions.

const crypto = require('crypto');
const User = require('../models/User');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { requireString, requireEmail, requirePassword, requireOneOf } = require('../utils/validators');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/token');

// Compares two secret strings in a way that takes the same time whatever the input,
// which makes guessing the invite code character by character harder.
function secretsMatch(given, expected) {
  const givenBuffer = Buffer.from(given);
  const expectedBuffer = Buffer.from(expected);
  return givenBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(givenBuffer, expectedBuffer);
}

// POST /api/auth/register
async function register(req, res) {
  const body = req.body ?? {};

  const name = requireString(body.name, 'Name', { min: 2, max: 60 });
  const email = requireEmail(body.email);
  const password = requirePassword(body.password);
  const role = body.role === undefined ? 'student' : requireOneOf(body.role, ['student', 'teacher'], 'Role');

  // Teacher accounts need the invite code that the server owner sets in .env.
  // Without this, anyone on the internet could create a teacher account.
  if (role === 'teacher') {
    if (!env.teacherInviteCode) {
      throw new AppError('Teacher sign-up is turned off on this server.', 403);
    }
    const inviteCode = requireString(body.teacherInviteCode, 'Teacher invite code', { min: 1, max: 100 });
    if (!secretsMatch(inviteCode, env.teacherInviteCode)) {
      throw new AppError('The teacher invite code is not correct.', 403);
    }
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists. Try logging in instead.', 409);
  }

  const user = new User({ name, email, role });
  await user.setPassword(password);
  await user.save();

  const token = signToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Your account has been created.',
    data: { user, token },
  });
}

// POST /api/auth/login
async function login(req, res) {
  const body = req.body ?? {};
  const email = requireEmail(body.email);
  const password = requireString(body.password, 'Password', { min: 1, max: 128 });

  const user = await User.findOne({ email }).select('+passwordHash +tokenVersion');

  // The same message is used for "no such account" and "wrong password",
  // so attackers cannot find out which emails are registered.
  const passwordIsCorrect = user ? await user.checkPassword(password) : false;
  if (!user || !passwordIsCorrect) {
    throw new AppError('Email or password is incorrect.', 401);
  }

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

  const token = signToken(user);
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: 'You are now logged in.',
    data: { user, token },
  });
}

// POST /api/auth/logout  (requires login)
async function logout(req, res) {
  // Changing tokenVersion makes every token issued before now invalid,
  // including a copy of the token that someone else may have taken.
  await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  clearAuthCookie(res);

  res.json({ success: true, message: 'You have been logged out.' });
}

// GET /api/auth/me  (requires login)
async function getMe(req, res) {
  res.json({ success: true, data: { user: req.user } });
}

// PATCH /api/auth/me  (requires login): change name or school/college name
async function updateProfile(req, res) {
  const body = req.body ?? {};
  const updates = {};

  if (body.name !== undefined) {
    updates.name = requireString(body.name, 'Name', { min: 2, max: 60 });
  }
  if (body.institution !== undefined) {
    updates.institution = requireString(body.institution, 'School or college name', { min: 0, max: 120 });
  }
  if (Object.keys(updates).length === 0) {
    throw new AppError('Send at least one field to update: name or institution.', 400);
  }

  // Only the fields listed above are ever written. Role and password cannot be changed here.
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

  res.json({ success: true, message: 'Your profile has been updated.', data: { user } });
}

// POST /api/auth/change-password  (requires login)
async function changePassword(req, res) {
  const body = req.body ?? {};
  const currentPassword = requireString(body.currentPassword, 'Current password', { min: 1, max: 128 });
  const newPassword = requirePassword(body.newPassword);

  const user = await User.findById(req.user._id).select('+passwordHash +tokenVersion');
  const currentIsCorrect = await user.checkPassword(currentPassword);
  if (!currentIsCorrect) {
    throw new AppError('Your current password is not correct.', 400);
  }
  if (currentPassword === newPassword) {
    throw new AppError('Choose a new password that is different from the current one.', 400);
  }

  await user.setPassword(newPassword);
  // Ends every other login session, because they used the old password
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();

  const token = signToken(user);
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: 'Your password has been changed. Other devices were logged out.',
    data: { token },
  });
}

module.exports = { register, login, logout, getMe, updateProfile, changePassword };
