// utils/token.js
// Creates login tokens (JWT) and stores them in a secure cookie.
//
// Why a cookie? The browser sends it automatically, and JavaScript on the page cannot read it
// (httpOnly), which protects the token from theft by injected scripts.
// API tools such as Postman can instead send the token in an "Authorization: Bearer" header.

const jwt = require('jsonwebtoken');
const env = require('../config/env');

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // keep in line with JWT_EXPIRES_IN (default 7 days)

// The token holds only the user id (sub) and the token version (tv).
// The role is NOT stored in the token. The server looks it up in the database on every request,
// so nobody can give themselves a teacher role by editing a token.
function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), tv: user.tokenVersion ?? 0 },
    env.jwtSecret,
    { algorithm: 'HS256', expiresIn: env.jwtExpiresIn }
  );
}

function cookieOptions() {
  return {
    httpOnly: true,
    // Cookies marked SameSite=None must also be Secure, so HTTPS is required for them
    secure: env.isProduction || env.cookieSameSite === 'none',
    sameSite: env.cookieSameSite,
    path: '/',
  };
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: COOKIE_MAX_AGE_MS });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

module.exports = { COOKIE_NAME, signToken, setAuthCookie, clearAuthCookie };
