// app.js
// Builds the Express application: security settings, middleware, routes and error handling.
// It does not start the server or connect to the database. server.js does that.

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// When the app runs behind a hosting provider (such as Render), trust its proxy
// so that rate limiting sees the real visitor address instead of the proxy's address.
if (env.isProduction) {
  app.set('trust proxy', 1);
}

// Helmet adds security headers that protect against common browser attacks
app.use(helmet());

// CORS: only the frontend addresses listed in CORS_ORIGIN may call the API from a browser.
app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (Postman, curl) are allowed through.
      // Unknown browser origins get no CORS permission, so the browser blocks them.
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true, // lets the browser send the login cookie
  })
);

// Reads JSON request bodies. The size limit protects the server from huge requests.
app.use(express.json({ limit: '100kb' }));

// Reads the login cookie from incoming requests
app.use(cookieParser());

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
