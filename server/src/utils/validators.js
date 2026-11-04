// utils/validators.js
// Small helper functions that check what users send us before we use it.
// Each one returns a clean value or throws an AppError (status 400) with a readable message.

const AppError = require('./AppError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

// Accepts only text (not objects or arrays), trims spaces, and checks the length.
// Rejecting objects matters for security: a request like {"name": {"$gt": ""}}
// could otherwise be used to manipulate database queries.
function requireString(value, fieldName, { min = 1, max = 200 } = {}) {
  if (typeof value !== 'string') {
    throw new AppError(`${fieldName} must be text.`, 400);
  }
  const cleaned = value.trim();
  if (cleaned.length < min) {
    throw new AppError(`${fieldName} must be at least ${min} character(s) long.`, 400);
  }
  if (cleaned.length > max) {
    throw new AppError(`${fieldName} must be ${max} characters or fewer.`, 400);
  }
  return cleaned;
}

function requireEmail(value) {
  const email = requireString(value, 'Email', { min: 5, max: 120 }).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError('Email address is not valid. Example: name@school.edu', 400);
  }
  return email;
}

// Passwords are not trimmed, because spaces can be a real part of a password.
function requirePassword(value) {
  if (typeof value !== 'string') {
    throw new AppError('Password must be text.', 400);
  }
  if (value.length < 8) {
    throw new AppError('Password must be at least 8 characters long.', 400);
  }
  if (value.length > 128) {
    throw new AppError('Password must be 128 characters or fewer.', 400);
  }
  return value;
}

// Checks that a value is a valid MongoDB ObjectId (24 hexadecimal characters)
function requireObjectId(value, fieldName = 'Id') {
  if (typeof value !== 'string' || !OBJECT_ID_PATTERN.test(value)) {
    throw new AppError(`${fieldName} is not valid.`, 400);
  }
  return value;
}

// Checks that a value is one of an allowed list, such as ['student', 'teacher']
function requireOneOf(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    throw new AppError(`${fieldName} must be one of: ${allowedValues.join(', ')}.`, 400);
  }
  return value;
}

// Checks that a value is a whole number inside a range
function requireInteger(value, fieldName, { min = 0, max = 1000000 } = {}) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new AppError(`${fieldName} must be a whole number from ${min} to ${max}.`, 400);
  }
  return value;
}

module.exports = {
  requireInteger,
  requireString,
  requireEmail,
  requirePassword,
  requireObjectId,
  requireOneOf,
};
