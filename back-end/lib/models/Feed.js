/**
 * Mongoose Schema for Feeds
 * 
 * Purpose: Defines the MongoDB schema and model for RSS/Atom feeds with proper
 * validation, indexing, and virtual properties.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  url: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid HTTP or HTTPS URL'
    }
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  favicon: {
    type: String,
    default: '/icons/rss.svg'
  },
  // Denormalized count, recalculated periodically
  articleCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  lastFetchAttempt: {
    type: Date
  },
  lastSuccessfulFetch: {
    type: Date
  },
  fetchErrors: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  feedType: {
    type: String,
    enum: ['rss', 'atom', 'rdf'],
    default: 'rss'
  },
  updateFrequency: {
    type: Number,
    default: 60, // minutes
    min: 5
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
feedSchema.index({ isActive: 1, userId: 1 });
feedSchema.index({ category: 1, userId: 1 });
feedSchema.index({ lastUpdated: -1 });
feedSchema.index({ url: 1 }, { unique: true });
feedSchema.index({ userId: 1, addedDate: -1 });

// Virtual for articles count (live count)
feedSchema.virtual('liveArticleCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'feedId',
  count: true
});

// Virtual for recent articles
feedSchema.virtual('recentArticles', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'feedId',
  options: { 
    sort: { dateAdded: -1 },
    limit: 10
  }
});

// Virtual for health status
feedSchema.virtual('healthStatus').get(function() {
  const now = new Date();
  const lastFetch = this.lastSuccessfulFetch || this.addedDate;
  const hoursSinceLastFetch = (now - lastFetch) / (1000 * 60 * 60);
  
  if (!this.isActive) return 'inactive';
  if (this.fetchErrors.length > 5) return 'error';
  if (hoursSinceLastFetch > 24) return 'stale';
  return 'healthy';
});

// Instance methods
feedSchema.methods.updateLastFetch = function(success = true, error = null) {
  this.lastFetchAttempt = new Date();
  
  if (success) {
    this.lastSuccessfulFetch = new Date();
    // Clear old errors on successful fetch
    this.fetchErrors = [];
  } else if (error) {
    this.fetchErrors.push({
      message: error,
      timestamp: new Date()
    });
    
    // Keep only last 10 errors
    if (this.fetchErrors.length > 10) {
      this.fetchErrors = this.fetchErrors.slice(-10);
    }
  }
  
  return this.save();
};

feedSchema.methods.incrementArticleCount = function(count = 1) {
  this.articleCount += count;
  this.lastUpdated = new Date();
  return this.save();
};

feedSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

feedSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Static methods
feedSchema.statics.findActive = function(userId) {
  return this.find({ isActive: true, userId }).sort({ name: 1 });
};

feedSchema.statics.findByCategory = function(category, userId) {
  return this.find({ category, userId }).sort({ name: 1 });
};

feedSchema.statics.findStale = function(hours = 24) {
  const staleDate = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    isActive: true,
    $or: [
      { lastSuccessfulFetch: { $lt: staleDate } },
      { lastSuccessfulFetch: { $exists: false } }
    ]
  });
};

feedSchema.statics.findWithErrors = function(errorThreshold = 3) {
  return this.find({
    isActive: true,
    $expr: { $gte: [{ $size: "$fetchErrors" }, errorThreshold] }
  });
};

feedSchema.statics.getCategories = function(userId) {
  return this.distinct('category', { userId });
};

// Pre-save middleware
feedSchema.pre('save', function(next) {
  // Ensure URL doesn't end with slash
  if (this.url && this.url.endsWith('/')) {
    this.url = this.url.slice(0, -1);
  }
  
  // Set lastUpdated when articleCount changes
  if (this.isModified('articleCount')) {
    this.lastUpdated = new Date();
  }
  
  next();
});

// Post-save middleware to update article count
feedSchema.post('save', async function(doc) {
  // Update live article count if needed
  const Article = mongoose.model('Article');
  const actualCount = await Article.countDocuments({ feedId: doc._id });
  
  if (actualCount !== doc.articleCount) {
    await this.constructor.findByIdAndUpdate(doc._id, { 
      articleCount: actualCount 
    });
  }
});

// Ensure virtual fields are serialized
feedSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Feed', feedSchema);