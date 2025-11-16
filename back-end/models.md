# Domain Models & Data Consistency Guide

Unified schema contracts (mock + Mongo layer) with fully normalized numeric seed data in both `baseData/` and `data/`.

## Overview

Core relationships:
- User (1) -> many Feeds
- User (1) -> many Articles
- Article (many) <-> Tag (many) via `article.tags` numeric ID array
- Article (1) -> many Highlights

All mock IDs are numbers. Mongo models continue to use ObjectIds; tag names are stored lowercase in Mongo while mock layer uses numeric IDs for joins.

## Seed Data Parity
`baseData/` and `data/` share the same structure:
- Numeric IDs for users, feeds, articles, tags, highlights.
- ISO8601 date strings for portability & deterministic diffs.
- Articles reference tags by numeric ID; tags contain denormalized `articleCount` recomputed on refresh.
The refresh script now performs only a copy plus `articleCount` recomputation—no ID conversion.

## Article Model (Mongo) (`lib/models/Article.js`)
```js
const articleSchema = new Schema({
  title: String,
  url: String,
  author: String,
  source: String,
  feedId: { type: ObjectId, ref: 'Feed', index: true, default: null },
  readingTimeMinutes: { type: Number, default: 1, min: 0 },
  wordCount: { type: Number, default: 100 },
  status: { type: String, enum: ['inbox','daily','continue','rediscovery','archived'], default: 'inbox' },
  isFavorite: { type: Boolean, default: false },
  tags: [{ type: String, lowercase: true }],
  dateAdded: { type: Date, default: Date.now },
  hasAnnotations: { type: Boolean, default: false },
  readProgress: { type: Number, default: 0, min: 0, max: 100 },
  content: { type: String, default: '' },
  excerpt: { type: String },
  articleHash: { type: String, index: true, sparse: true },
  lastRead: Date,
  userId: { type: ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```
Key behaviors: tag normalization, progress clamping, derived excerpt/hash.

## Tag Model (Mongo) (`lib/models/Tag.js`)
```js
const tagSchema = new Schema({
  name: { type: String, required: true, lowercase: true, trim: true, maxlength: 100, index: true },
  description: { type: String, default: '', maxlength: 500 },
  category: { type: String, default: 'General', trim: true },
  articleCount: { type: Number, default: 0, min: 0 },
  createdDate: { type: Date, default: Date.now },
  isSystem: { type: Boolean, default: false },
  userId: { type: ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });
```
Color deprecated (UI derives palette from name hash).

## Feed Model (Mongo) (`lib/models/Feed.js`)
```js
const feedSchema = new Schema({
  name: String, url: String, description: String,
  category: { type: String, default: 'General' },
  isActive: { type: Boolean, default: true },
  favicon: { type: String, default: '/icons/rss.svg' },
  articleCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  addedDate: { type: Date, default: Date.now },
  lastFetchAttempt: Date, lastSuccessfulFetch: Date,
  fetchErrors: [{ message: String, timestamp: { type: Date, default: Date.now } }],
  feedType: { type: String, enum: ['rss','atom','rdf'], default: 'rss' },
  updateFrequency: { type: Number, default: 60, min: 5 },
  userId: { type: ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });
```

## Highlight Model (Mongo) (`lib/models/Highlight.js`)
```js
const highlightSchema = new Schema({
  articleId: { type: ObjectId, ref: 'Article', required: true, index: true },
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true, maxlength: 10000 },
  note: { type: String, default: '', maxlength: 2000 },
  color: { type: String, default: 'yellow', enum: ['yellow','green','blue','purple','red','orange','pink'] },
  position: { startOffset: Number, endOffset: Number, startContainer: String, endContainer: String, xpath: String, cssSelector: String },
  tags: [{ type: String, lowercase: true, trim: true }],
  isPublic: { type: Boolean, default: false },
  metadata: { pageUrl: String, pageTitle: String, selectedBy: String, device: String, browser: String }
}, { timestamps: true });
```

## User Model (Mongo) (`lib/models/User.js`)
```js
const userSchema = new Schema({
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 30, lowercase: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, minlength: 6, select: false },
  isActive: { type: Boolean, default: true },
  profile: { firstName: String, lastName: String, avatar: { type: String, default: '/images/default-avatar.png' }, bio: String, preferences: { theme: { type: String, enum: ['light','dark','auto'], default: 'light' }, notifications: { type: Boolean, default: true }, autoArchive: { type: Boolean, default: false }, readingGoal: { type: Number, default: 5, min: 1, max: 100 }, language: { type: String, default: 'en' }, timezone: { type: String, default: 'UTC' } } },
  stats: { totalArticles: { type: Number, default: 0 }, totalReadingTime: { type: Number, default: 0 }, favoriteCount: { type: Number, default: 0 }, tagsUsed: { type: Number, default: 0 }, joinedDate: { type: Date, default: Date.now }, lastLogin: { type: Date, default: Date.now }, streakDays: { type: Number, default: 0 }, longestStreak: { type: Number, default: 0 } },
  security: { lastPasswordChange: { type: Date, default: Date.now }, failedLoginAttempts: { type: Number, default: 0 }, lockoutUntil: Date, twoFactorEnabled: { type: Boolean, default: false } },
  subscription: { plan: { type: String, enum: ['free','premium','enterprise'], default: 'free' }, expiresAt: Date, features: [String] }
}, { timestamps: true });
```

## Consistency Rules
1. Each article tag ID must exist in `mockTags`.
2. Each highlight references existing `articleId` & `userId`.
3. Tag `articleCount` is recomputed on refresh; treat stored values as ephemeral.
4. Tag names are lowercase; API accepts case-insensitive queries.

## Tag Article Count Derivation
`refreshDataFromBase.js` recalculates counts from articles on every run (no ID conversion necessary).

## Validation Checklist
- [x] Base and data seeds share identical format.
- [x] Articles reference valid tag IDs.
- [x] Highlights reference existing article/user.
- [x] Tag counts recompute correctly.
- [x] Tests assert presence of `articleCount`.

## Quick Consistency Script (Optional)
```js
const { mockArticles } = require('./data/mockArticles');
const { mockTags } = require('./data/mockTags');
const missing = new Set();
for (const a of mockArticles) {
  for (const t of a.tags) if (!mockTags.find(x => x.id === t)) missing.add(t);
}
console.log('Missing tag IDs:', [...missing]);
```

---
Update this document whenever schema or relational rules evolve.
