// models/User.js
// One account for every person who logs in: students and teachers share this collection.
// The role decides what the account may do. Only minimal personal data is stored.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12; // higher = slower to hash, harder to crack

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    // Hash of the password. Never the password itself.
    // select: false means it is not returned by normal queries.
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
      required: true,
    },
    // Optional school or college name, used for display and reports
    institution: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    // Experience points earned from challenges, missions and eco actions
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Codes of badges earned, for example 'first_challenge'. Names live in services/gamification.js
    badges: {
      type: [String],
      default: [],
    },
    // Changes when the user logs out or changes the password.
    // Tokens carry the number they were issued with, so old tokens stop working.
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash a new plain-text password and store only the hash
userSchema.methods.setPassword = async function setPassword(plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
};

// Compare a plain-text password with the stored hash
userSchema.methods.checkPassword = function checkPassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Whenever a user is turned into JSON (for example in an API response),
// remove private fields and rename _id to id.
userSchema.set('toJSON', {
  transform(doc, returned) {
    returned.id = String(returned._id);
    delete returned._id;
    delete returned.__v;
    delete returned.passwordHash;
    delete returned.tokenVersion;
    return returned;
  },
});

module.exports = mongoose.model('User', userSchema);
