// config/env.js
// Reads settings from server/.env and checks the important ones.
// If something essential is missing, the server stops right away with a clear message
// instead of failing later in a confusing way.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const requiredSettings = ['MONGODB_URI', 'JWT_SECRET'];
const missingSettings = requiredSettings.filter((name) => !process.env[name]);

if (missingSettings.length > 0) {
  throw new Error(
    `Missing settings in server/.env: ${missingSettings.join(', ')}. ` +
      'Copy server/.env.example to server/.env and fill in the values.'
  );
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long. Generate a longer one.');
}

const cookieSameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
  throw new Error('COOKIE_SAME_SITE must be one of: lax, strict, none.');
}

const nodeEnv = process.env.NODE_ENV || 'development';

const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSameSite,
  // Several frontend addresses can be allowed, separated by commas
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // Empty means teacher sign-up is turned off
  teacherInviteCode: process.env.TEACHER_INVITE_CODE || '',
};

module.exports = env;
