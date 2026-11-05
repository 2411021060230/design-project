// middleware/errorHandler.js
// One place that turns every error into a JSON response in the same shape:
//   { "success": false, "message": "...", "details": [...optional] }
// Stack traces are shown only in development, never in production.

const env = require('../config/env');
const AppError = require('../utils/AppError');

// Runs when no route matched the request
function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Express recognises this function as an error handler because it has four parameters.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = 'Something went wrong on the server. Please try again.';
  let details;

  // Errors we wrote on purpose, or errors from libraries that are safe to show
  if (err.isOperational || err.expose === true) {
    message = err.message;
    details = err.details;
  }

  // Mongoose: a value has the wrong format, for example an invalid id
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'One of the values you sent is in the wrong format.';
  }

  // Mongoose: a document failed its schema rules
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Some of the information you entered is not valid.';
    details = Object.values(err.errors).map((problem) => ({
      field: problem.path,
      message: problem.message,
    }));
  }

  // MongoDB duplicate key (a unique field such as email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'That information is already in use.';
  }

  // Request body is not valid JSON
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'The request body must be valid JSON.';
  }

  // Keep detailed errors in the server log for the developer
  if (statusCode >= 500) {
    console.error('Server error:', err);
  }

  const body = { success: false, message };
  if (details) body.details = details;
  if (!env.isProduction && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
