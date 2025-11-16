/**
 * Mongoose Schema for Tags
 * 
 * Purpose: Defines the MongoDB schema and model for tags with proper
 * validation, indexing, and virtual properties.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    lowercase: true,
    index: true // quick lookup
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
    maxlength: 100
  },
  color: {
    type: String,
    default: '#6366f1',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  // Persisted denormalized count; always recomputed in service layer for consistency
  articleCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  isSystem: {
    type: Boolean,
    default: false // System tags are created by the app, not users
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
tagSchema.index({ name: 1, userId: 1 }, { unique: true }); // Prevent duplicate tag names per user
tagSchema.index({ category: 1, userId: 1 });
tagSchema.index({ articleCount: -1, userId: 1 });
tagSchema.index({ userId: 1, createdDate: -1 });

// Virtual for articles using this tag
tagSchema.virtual('articles', {
  ref: 'Article',
  localField: 'name',
  foreignField: 'tags'
});

// Virtual for live article count
tagSchema.virtual('liveArticleCount', {
  ref: 'Article',
  localField: 'name',
  foreignField: 'tags',
  count: true
});

// Virtual for usage frequency (articles per day since creation)
tagSchema.virtual('usageFrequency').get(function() {
  const now = new Date();
  const daysSinceCreation = (now - this.createdDate) / (1000 * 60 * 60 * 24);
  return daysSinceCreation > 0 ? this.articleCount / daysSinceCreation : 0;
});

// Instance methods
tagSchema.methods.incrementCount = function(amount = 1) {
  this.articleCount += amount;
  return this.save();
};

tagSchema.methods.decrementCount = function(amount = 1) {
  this.articleCount = Math.max(0, this.articleCount - amount);
  return this.save();
};

tagSchema.methods.updateCount = async function() {
  const Article = mongoose.model('Article');
  const count = await Article.countDocuments({ tags: this.name, userId: this.userId });
  if (this.articleCount !== count) {
    this.articleCount = count;
    await this.save();
  }
  return this;
};

// Static methods
tagSchema.statics.findByCategory = function(category, userId) {
  return this.find({ category, userId }).sort({ name: 1 });
};

tagSchema.statics.findPopular = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ articleCount: -1 })
    .limit(limit);
};

tagSchema.statics.findUnused = function(userId) {
  return this.find({ articleCount: 0, userId }).sort({ createdDate: -1 });
};

tagSchema.statics.findOrCreate = async function(name, userId, options = {}) {
  const normalizedName = name.toLowerCase().trim();
  
  let tag = await this.findOne({ name: normalizedName, userId });
  
  if (!tag) {
    tag = await this.create({
      name: normalizedName,
      userId,
      ...options
    });
  }
  
  return tag;
};

tagSchema.statics.search = function(query, userId) {
  const regex = new RegExp(query, 'i');
  return this.find({
    userId,
    $or: [
      { name: regex },
      { description: regex }
    ]
  }).sort({ articleCount: -1, name: 1 });
};

tagSchema.statics.getCategories = function(userId) {
  return this.distinct('category', { userId });
};

tagSchema.statics.getMostUsedColors = function(userId, limit = 10) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$color', count: { $sum: '$articleCount' } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Pre-save middleware
tagSchema.pre('save', function(next) {
  // Normalize tag name
  if (this.name) {
    this.name = this.name.toLowerCase().trim();
  }
  
  // Validate tag name doesn't contain special characters
  if (this.name && !/^[a-z0-9\s\-_]+$/.test(this.name)) {
    return next(new Error('Tag name can only contain letters, numbers, spaces, hyphens, and underscores'));
  }
  
  // Ensure color starts with #
  if (this.color && !this.color.startsWith('#')) {
    this.color = '#' + this.color;
  }
  
  next();
});

// Pre-remove middleware to update article references
tagSchema.pre('remove', async function(next) {
  const Article = mongoose.model('Article');
  
  // Remove this tag from all articles
  await Article.updateMany(
    { tags: this.name, userId: this.userId },
    { $pull: { tags: this.name } }
  );
  
  next();
});

// Post-save middleware to sync article count
tagSchema.post('save', async function(doc) {
  // Sync denormalized count post-save
  const Article = mongoose.model('Article');
  const actualCount = await Article.countDocuments({ tags: doc.name, userId: doc.userId });
  if (actualCount !== doc.articleCount) {
    await this.constructor.findByIdAndUpdate(doc._id, { articleCount: actualCount });
  }
});

// Ensure virtual fields are serialized
tagSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Tag', tagSchema);