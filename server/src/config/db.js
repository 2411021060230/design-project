// config/db.js
// Connects Mongoose to MongoDB (local server or MongoDB Atlas).

const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  // Strict query mode: fields not defined in a model are not used in searches
  mongoose.set('strictQuery', true);
  // Removes keys that start with "$" from search filters.
  // This blocks NoSQL injection, where a value like {"$ne": null} is sent instead of text.
  mongoose.set('sanitizeFilter', true);

  await mongoose.connect(env.mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host} / database "${mongoose.connection.name}"`);
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
