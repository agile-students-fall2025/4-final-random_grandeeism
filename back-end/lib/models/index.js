/**
 * Models Index
 * 
 * Purpose: Centralized export of all Mongoose models for the application.
 * This allows for easy importing of models throughout the application.
 */

const Article = require('./Article');
const Feed = require('./Feed');
const Tag = require('./Tag');
const User = require('./User');
const Highlight = require('./Highlight');

module.exports = {
  Article,
  Feed,
  Tag,
  User,
  Highlight
};