/**
 * Mongoose Schema for Users
 * 
 * Purpose: Defines the MongoDB schema and model for users with proper
 * validation, indexing, password hashing, and virtual properties.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    validate: {
      validator: v => /^[a-z0-9_]+$/.test(v),
      message: 'Username can only contain lowercase letters, numbers, and underscores'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    avatar: {
      type: String,
      default: '/images/default-avatar.png'
    },
    bio: {
      type: String,
      maxlength: 500
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      autoArchive: {
        type: Boolean,
        default: false
      },
      readingGoal: {
        type: Number,
        default: 5,
        min: 1,
        max: 100
      },
      language: {
        type: String,
        default: 'en'
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  stats: {
    totalArticles: {
      type: Number,
      default: 0,
      min: 0
    },
    totalReadingTime: {
      type: Number,
      default: 0,
      min: 0 // in minutes
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0
    },
    tagsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    streakDays: {
      type: Number,
      default: 0,
      min: 0
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  security: {
    lastPasswordChange: {
      type: Date,
      default: Date.now
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    lockoutUntil: {
      type: Date
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    expiresAt: {
      type: Date
    },
    features: [{
      type: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ isActive: 1 });
userSchema.index({ 'stats.lastLogin': -1 });
userSchema.index({ 'subscription.plan': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  const firstName = this.profile?.firstName || '';
  const lastName = this.profile?.lastName || '';
  return `${firstName} ${lastName}`.trim() || this.username;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.security?.lockoutUntil && this.security.lockoutUntil > Date.now());
});

// Virtual for subscription status
userSchema.virtual('subscriptionStatus').get(function() {
  if (!this.subscription?.expiresAt) return 'active';
  return this.subscription.expiresAt > Date.now() ? 'active' : 'expired';
});

// Virtual for articles count
userSchema.virtual('articlesCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'userId',
  count: true
});

// Virtual for feeds count
userSchema.virtual('feedsCount', {
  ref: 'Feed',
  localField: '_id',
  foreignField: 'userId',
  count: true
});

// Virtual for tags count
userSchema.virtual('tagsCount', {
  ref: 'Tag',
  localField: '_id',
  foreignField: 'userId',
  count: true
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLastLogin = function() {
  this.stats.lastLogin = new Date();
  this.security.failedLoginAttempts = 0;
  this.security.lockoutUntil = undefined;
  return this.save();
};

userSchema.methods.incrementFailedLogin = function() {
  this.security.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.security.failedLoginAttempts >= 5) {
    this.security.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  return this.save();
};

userSchema.methods.updateReadingStats = function(readingTimeMinutes) {
  this.stats.totalReadingTime += readingTimeMinutes;
  
  // Update streak logic would go here
  // This is a simplified version
  const today = new Date().toDateString();
  const lastLogin = new Date(this.stats.lastLogin).toDateString();
  
  if (today !== lastLogin) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (lastLogin === yesterday) {
      this.stats.streakDays += 1;
    } else {
      this.stats.streakDays = 1;
    }
    
    this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.streakDays);
  }
  
  return this.save();
};

userSchema.methods.updateStats = async function() {
  const Article = mongoose.model('Article');
  const Feed = mongoose.model('Feed');
  const Tag = mongoose.model('Tag');
  
  const [articleCount, feedCount, tagCount, favoriteCount] = await Promise.all([
    Article.countDocuments({ userId: this._id }),
    Feed.countDocuments({ userId: this._id }),
    Tag.countDocuments({ userId: this._id }),
    Article.countDocuments({ userId: this._id, isFavorite: true })
  ]);
  
  this.stats.totalArticles = articleCount;
  this.stats.favoriteCount = favoriteCount;
  this.stats.tagsUsed = tagCount;
  
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() }).select('+password');
};

userSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ 'stats.lastLogin': -1 });
};

userSchema.statics.findInactive = function(daysSince = 30) {
  const cutoffDate = new Date(Date.now() - (daysSince * 24 * 60 * 60 * 1000));
  return this.find({ 
    isActive: true,
    'stats.lastLogin': { $lt: cutoffDate }
  });
};

userSchema.statics.findBySubscription = function(plan) {
  return this.find({ 'subscription.plan': plan });
};

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.security.lastPasswordChange = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function(next) {
  // Normalize username and email
  if (this.username) {
    this.username = this.username.toLowerCase().trim();
  }
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  // Initialize nested objects if they don't exist
  if (!this.profile) this.profile = {};
  if (!this.stats) this.stats = {};
  if (!this.security) this.security = {};
  if (!this.subscription) this.subscription = {};
  
  next();
});

// Pre-remove middleware
userSchema.pre('remove', async function(next) {
  const Article = mongoose.model('Article');
  const Feed = mongoose.model('Feed');
  const Tag = mongoose.model('Tag');
  const Highlight = mongoose.model('Highlight');
  
  // Remove all user's data
  await Promise.all([
    Article.deleteMany({ userId: this._id }),
    Feed.deleteMany({ userId: this._id }),
    Tag.deleteMany({ userId: this._id }),
    Highlight.deleteMany({ userId: this._id })
  ]);
  
  next();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);