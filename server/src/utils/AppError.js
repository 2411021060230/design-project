// utils/AppError.js
// An "expected" error: something we planned for, such as a wrong password or missing field.
// The error handler sends its message to the user as-is.
// Any other (unexpected) error shows a generic message, so internal details stay private.

class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

module.exports = AppError;
