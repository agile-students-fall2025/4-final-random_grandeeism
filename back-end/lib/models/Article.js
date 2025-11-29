/**
 * Mongoose Schema for Articles
 * 
 * Purpose: Defines the MongoDB schema and model for articles with proper
 * validation, indexing, and virtual properties.
 * 
 * Content Fields:
 * - content: HTML content with images preserved (for default view)
 * - contentNoImages: HTML content without images (for reader settings toggle)
 * - textContent: Plain text version for search and word count
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid HTTP or HTTPS URL'
    }
  },
  author: {
    type: String,
    default: 'Unknown Author',
    trim: true,
    maxlength: 200
  },
  source: {
    type: String,
    default: 'Unknown Source',
    trim: true,
    maxlength: 200
  },
  // Numeric feedId reference in mock layer; Mongo layer keeps ObjectId but we
  // document consistency via models.md. For persistence we still use ObjectId.
  feedId: {
    type: Schema.Types.ObjectId,
    ref: 'Feed',
    default: null,
    index: true
  },
  // Store readingTime in minutes (number) for consistency; mock layer had strings
  readingTimeMinutes: {
    type: Number,
    default: 1,
    min: 0
  },
  wordCount: {
    type: Number,
    default: 100,
    min: 0
  },
  status: {
    type: String,
    enum: ['inbox', 'daily', 'continue', 'rediscovery', 'archived'],
    default: 'inbox',
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  // Normalize tags to ObjectId references to Tag OR fallback to string name.
  // For now we store lowercase names; in Mongo migrations we can switch to ObjectId.
  tags: [{ type: String, trim: true, lowercase: true }],
  dateAdded: {
    type: Date,
    default: Date.now
  },
  hasAnnotations: {
    type: Boolean,
    default: false
  },
  readProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  content: {
    type: String,
    default: ''
  },
  contentNoImages: {
    type: String,
    default: ''
  },
  textContent: {
    type: String,
    default: ''
  },
  // Derived field kept in mock layer; here maintained for parity
  articleHash: {
    type: String,
    index: true,
    sparse: true
  },
  excerpt: {
    type: String,
    maxlength: 1000
  },
  thumbnail: {
    type: String
  },
  lastRead: {
    type: Date
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
articleSchema.index({ status: 1, userId: 1 });
articleSchema.index({ isFavorite: 1, userId: 1 });
articleSchema.index({ tags: 1, userId: 1 });
articleSchema.index({ feedId: 1 });
articleSchema.index({ readingTimeMinutes: 1 });
articleSchema.index({ dateAdded: -1 });
articleSchema.index({ url: 1, userId: 1 }, { unique: true }); // Prevent duplicate URLs per user

// Virtual for highlights count
articleSchema.virtual('highlightsCount', {
  ref: 'Highlight',
  localField: '_id',
  foreignField: 'articleId',
  count: true
});

// Instance methods
articleSchema.methods.updateReadProgress = function(progress) {
  this.readProgress = Math.max(0, Math.min(100, progress));
  if (progress > 0) {
    this.lastRead = new Date();
  }
  return this.save();
};

articleSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

articleSchema.methods.addTag = function(tag) {
  const normalized = String(tag).toLowerCase().trim();
  if (!this.tags.includes(normalized)) {
    this.tags.push(normalized);
    return this.save();
  }
  return Promise.resolve(this);
};

articleSchema.methods.removeTag = function(tag) {
  const normalized = String(tag).toLowerCase().trim();
  this.tags = this.tags.filter(t => t !== normalized);
  return this.save();
};

// Static methods
articleSchema.statics.findByStatus = function(status, userId) {
  return this.find({ status, userId }).sort({ dateAdded: -1 });
};

articleSchema.statics.findFavorites = function(userId) {
  return this.find({ isFavorite: true, userId }).sort({ dateAdded: -1 });
};

articleSchema.statics.findByTag = function(tag, userId) {
  const normalized = String(tag).toLowerCase().trim();
  return this.find({ tags: normalized, userId }).sort({ dateAdded: -1 });
};

articleSchema.statics.findUntagged = function(userId) {
  return this.find({ 
    $or: [
      { tags: { $size: 0 } },
      { tags: { $exists: false } }
    ],
    userId 
  }).sort({ dateAdded: -1 });
};

// Pre-save middleware
articleSchema.pre('save', function(next) {
  // Auto-generate excerpt from content if not provided
  if (!this.excerpt && this.content) {
    const raw = this.content.replace(/\s+/g, ' ').trim();
    this.excerpt = raw.substring(0, 300).trim();
    if (raw.length > 300) {
      this.excerpt += '...';
    }
  }
  // Recompute articleHash if content changed
  if (this.isModified('content')) {
    this.articleHash = require('crypto').createHash('sha1').update(this.content).digest('hex');
  }
  
  // Update hasAnnotations based on highlights
  // This would be handled by the application layer in practice
  
  next();
});

// Ensure virtual fields are serialized
articleSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Article', articleSchema);