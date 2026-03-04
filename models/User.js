// models/User.js (Complete - already provided)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    age: {
      type: Number,
      min: [5, 'Age must be at least 5'],
      max: [120, 'Invalid age'],
    },
    phone: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },

    // ── Auth ────────────────────────────────────
    googleId: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpire: {
      type: Date,
      default: null,
    },

    // ── Password Reset ──────────────────────────
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },

    // ── Refresh Token ───────────────────────────
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    // ── Gita Wisdom Progress ────────────────────
    progress: {
      totalRead:    { type: Number, default: 0 },
      currentIndex: { type: Number, default: 0 },
      readHistory: [
        {
          chapter: Number,
          verse:   Number,
          readAt:  { type: Date, default: Date.now },
        },
      ],
      favorites: [
        {
          chapter: Number,
          verse:   Number,
          savedAt: { type: Date, default: Date.now },
        },
      ],
      bookmarks: [
        {
          chapter: Number,
          verse:   Number,
          savedAt: { type: Date, default: Date.now },
        },
      ],
      chaptersExplored: [{ type: Number }],
    },

    // ── Streak ──────────────────────────────────
    streak: {
      current:  { type: Number, default: 0 },
      longest:  { type: Number, default: 0 },
      lastRead: { type: Date,   default: null },
      readDates:[{ type: String }],
    },

    // ── Mood Journal ────────────────────────────
    moods: [
      {
        mood:      String,
        shlokRef:  String,
        loggedAt:  { type: Date, default: Date.now },
      },
    ],

    // ── Preferences ─────────────────────────────
    preferences: {
      dailyReminder: { type: Boolean, default: true  },
      hindiFirst:    { type: Boolean, default: true  },
      autoNext:      { type: Boolean, default: false },
      soundEffects:  { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update streak method
UserSchema.methods.updateStreak = function () {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (this.streak.readDates.includes(today)) return;

  this.streak.readDates.push(today);

  if (this.streak.lastRead) {
    const lastDate = new Date(this.streak.lastRead).toISOString().split('T')[0];
    if (lastDate === yesterday) {
      this.streak.current += 1;
    } else if (lastDate !== today) {
      this.streak.current = 1;
    }
  } else {
    this.streak.current = 1;
  }

  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }

  this.streak.lastRead = new Date();
};

module.exports = mongoose.model('User', UserSchema);