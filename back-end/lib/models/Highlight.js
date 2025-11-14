/**
 * Mongoose Schema for Highlights
 * 
 * Purpose: Defines the MongoDB schema and model for article highlights/annotations
 * with proper validation, indexing, and virtual properties.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const highlightSchema = new Schema({
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000 // Maximum length for highlighted text
  },
  note: {
    type: String,
    default: '',
    trim: true,
    maxlength: 2000 // Maximum length for user notes
  },
  color: {
    type: String,
    default: 'yellow',
    enum: ['yellow', 'green', 'blue', 'purple', 'red', 'orange', 'pink'],
    lowercase: true
  },
  position: {
    startOffset: {
      type: Number,
      required: true,
      min: 0
    },
    endOffset: {
      type: Number,
      required: true,
      min: 0
    },
    startContainer: {
      type: String,
      default: ''
    },
    endContainer: {
      type: String,
      default: ''
    },
    xpath: {
      type: String,
      default: '' // XPath to the highlighted element
    },
    cssSelector: {
      type: String,
      default: '' // CSS selector as backup
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false // Whether highlight is shared publicly
  },
  metadata: {
    pageUrl: String,
    pageTitle: String,
    selectedBy: String, // How the text was selected (mouse, keyboard, etc.)
    device: String, // Device type when highlight was created
    browser: String // Browser information
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
highlightSchema.index({ articleId: 1, userId: 1 });
highlightSchema.index({ userId: 1, createdAt: -1 });
highlightSchema.index({ color: 1, userId: 1 });
highlightSchema.index({ tags: 1, userId: 1 });
highlightSchema.index({ isPublic: 1 });
highlightSchema.index({ 'position.startOffset': 1, 'position.endOffset': 1 });

// Virtual for highlight length
highlightSchema.virtual('length').get(function() {
  return this.text ? this.text.length : 0;
});

// Virtual for position range
highlightSchema.virtual('range').get(function() {
  return this.position.endOffset - this.position.startOffset;
});

// Virtual for has note
highlightSchema.virtual('hasNote').get(function() {
  return this.note && this.note.trim().length > 0;
});

// Virtual for article reference
highlightSchema.virtual('article', {
  ref: 'Article',
  localField: 'articleId',
  foreignField: '_id',
  justOne: true
});

// Virtual for user reference
highlightSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Instance methods
highlightSchema.methods.addNote = function(noteText) {
  this.note = noteText.trim();
  return this.save();
};

highlightSchema.methods.updateColor = function(newColor) {
  const validColors = ['yellow', 'green', 'blue', 'purple', 'red', 'orange', 'pink'];
  if (validColors.includes(newColor.toLowerCase())) {
    this.color = newColor.toLowerCase();
    return this.save();
  }
  throw new Error('Invalid highlight color');
};

highlightSchema.methods.addTag = function(tag) {
  const normalizedTag = tag.toLowerCase().trim();
  if (!this.tags.includes(normalizedTag)) {
    this.tags.push(normalizedTag);
    return this.save();
  }
  return Promise.resolve(this);
};

highlightSchema.methods.removeTag = function(tag) {
  const normalizedTag = tag.toLowerCase().trim();
  this.tags = this.tags.filter(t => t !== normalizedTag);
  return this.save();
};

highlightSchema.methods.togglePublic = function() {
  this.isPublic = !this.isPublic;
  return this.save();
};

// Static methods
highlightSchema.statics.findByArticle = function(articleId, userId = null) {
  const query = { articleId };
  if (userId) {
    query.userId = userId;
  } else {
    query.isPublic = true; // Only public highlights if no user specified
  }
  return this.find(query).sort({ 'position.startOffset': 1 });
};

highlightSchema.statics.findByUser = function(userId, limit = null) {
  const query = this.find({ userId }).sort({ createdAt: -1 });
  return limit ? query.limit(limit) : query;
};

highlightSchema.statics.findByColor = function(color, userId) {
  return this.find({ color: color.toLowerCase(), userId }).sort({ createdAt: -1 });
};

highlightSchema.statics.findWithNotes = function(userId) {
  return this.find({ 
    userId,
    note: { $exists: true, $ne: '' }
  }).sort({ createdAt: -1 });
};

highlightSchema.statics.findByTag = function(tag, userId) {
  return this.find({ 
    tags: tag.toLowerCase(),
    userId 
  }).sort({ createdAt: -1 });
};

highlightSchema.statics.findPublic = function(limit = 50) {
  return this.find({ isPublic: true })
    .populate('article', 'title url')
    .populate('user', 'username profile.firstName profile.lastName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

highlightSchema.statics.search = function(query, userId) {
  const regex = new RegExp(query, 'i');
  return this.find({
    userId,
    $or: [
      { text: regex },
      { note: regex }
    ]
  }).sort({ createdAt: -1 });
};

highlightSchema.statics.getColorDistribution = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$color', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

highlightSchema.statics.getTagsUsed = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// Pre-save middleware
highlightSchema.pre('save', function(next) {
  // Validate position offsets
  if (this.position.startOffset >= this.position.endOffset) {
    return next(new Error('Start offset must be less than end offset'));
  }
  
  // Ensure tags are normalized
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
    // Remove duplicates
    this.tags = [...new Set(this.tags)];
  }
  
  // Trim note
  if (this.note) {
    this.note = this.note.trim();
  }
  
  next();
});

// Post-save middleware
highlightSchema.post('save', async function(doc) {
  // Update article's hasAnnotations flag
  const Article = mongoose.model('Article');
  const hasHighlights = await this.constructor.exists({ articleId: doc.articleId });
  
  await Article.findByIdAndUpdate(doc.articleId, { 
    hasAnnotations: !!hasHighlights 
  });
});

// Post-remove middleware
highlightSchema.post('remove', async function(doc) {
  // Update article's hasAnnotations flag
  const Article = mongoose.model('Article');
  const hasHighlights = await this.constructor.exists({ articleId: doc.articleId });
  
  await Article.findByIdAndUpdate(doc.articleId, { 
    hasAnnotations: !!hasHighlights 
  });
});

// Ensure virtual fields are serialized
highlightSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Highlight', highlightSchema);