/**
 * Express Validation Middleware
 * 
 * This file contains all input validation rules for API endpoints using express-validator.
 * 
 * Key features:
 * - Input sanitization (trim, escape) to prevent XSS attacks
 * - Data type validation and format checking
 * - Custom error messages for better user experience
 * - Middleware pattern for easy integration with routes
 * 
 * Usage in routes:
 * router.post('/', validateArticle, handleValidationErrors, routeHandler);
 */

const { body, validationResult } = require('express-validator');

/**
 * User Registration Validation
 * 
 * Validates new user signup data with security considerations:
 * - Email: Must be valid format, normalized for consistency
 * - Username: 3-30 chars, trimmed and escaped for XSS protection
 * - Password: Minimum 8 chars (hashed later with bcrypt)
 * - DisplayName: Optional, trimmed, max 100 chars for UI layout
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(), // Converts to lowercase, removes dots from Gmail
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .trim() // Remove leading/trailing whitespace
    .escape(), // Convert HTML entities to prevent XSS
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
    // Note: Password is not escaped as it will be hashed
  body('displayName')
    .optional() // Field is not required
    .isLength({ max: 100 })
    .withMessage('Display name must be 100 characters or less')
    .trim()
];

/**
 * User Login Validation
 * 
 * Simpler validation for login - just checks required fields.
 * Note: 'username' field accepts either username OR email for user convenience
 * Backend will handle checking both username and email fields in database
 */
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
  // Note: No password validation here since we're just checking credentials
];

/**
 * Article Creation/Update Validation
 * 
 * Validates article data for both manual additions and RSS feed imports.
 * 
 * Field explanations:
 * - title: Required, used in UI lists and search (500 char limit for display)
 * - url: Optional for manual entries, auto-populated for web articles
 * - content: Optional, extracted content or user-provided text (1MB limit)
 * - status: Reading workflow states (see status enum below)
 * - feedId: Links article to RSS feed source if applicable
 */
const validateArticle = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 500 })
    .withMessage('Title must be 500 characters or less')
    .trim(),
  body('url')
    .optional()
    .isURL()
    .withMessage('Must be a valid URL'),
  body('content')
    .optional()
    .isLength({ max: 1000000 }) // 1MB limit for large articles
    .withMessage('Content too large'),
  /**
   * Article Status Enum:
   * - inbox: Newly added, unread
   * - continue: Started reading, need to finish
   * - daily: Scheduled for today's reading
   * - rediscovery: Surfaced by rediscovery algorithm
   * - archived: Completed reading, stored for reference
   */
  body('status')
    .optional()
    .isIn(['inbox', 'continue', 'daily', 'rediscovery', 'archived'])
    .withMessage('Invalid status'),
  body('feedId')
    .optional()
    .isString()
    .trim()
];

/**
 * Validation rules for tag creation/update
 */
const validateTag = [
  body('name')
    .notEmpty()
    .withMessage('Tag name is required')
    .isLength({ max: 50 })
    .withMessage('Tag name must be 50 characters or less')
    .trim()
    .escape(),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color (e.g., #FF5733)')
];

/**
 * Validation rules for highlight creation/update
 * Matches API contract:
 *  - annotations: optional object { title?, note? }
 *  - color: optional hex color string like #fef08a
 *  - position: required object with numeric start/end
 */
const validateHighlight = [
  body('articleId')
    .notEmpty()
    .withMessage('Article ID is required')
    .isString(),
  body('text')
    .notEmpty()
    .withMessage('Highlighted text is required')
    .isLength({ max: 10000 })
    .withMessage('Highlighted text too long')
    .trim(),
  body('annotations')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (Array.isArray(value)) throw new Error('`annotations` must be a single object, not an array');
      if (typeof value !== 'object') throw new Error('`annotations` must be an object');
      if (value.title !== undefined && typeof value.title !== 'string') throw new Error('`annotations.title` must be a string');
      if (value.note !== undefined && typeof value.note !== 'string') throw new Error('`annotations.note` must be a string');
      if (value.title && value.title.length > 500) throw new Error('`annotations.title` must be 500 characters or less');
      if (value.note && value.note.length > 5000) throw new Error('`annotations.note` must be 5000 characters or less');
      return true;
    }),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color (e.g., #FF5733)'),
  body('position')
    .notEmpty()
    .withMessage('Position is required')
    .custom((value) => {
      if (typeof value !== 'object' || value === null) throw new Error('`position` must be an object');
      if (value.start === undefined || value.end === undefined) throw new Error('`position` must include start and end');
      const start = Number(value.start);
      const end = Number(value.end);
      if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error('`position.start` and `position.end` must be numbers');
      if (start < 0 || end < 0) throw new Error('`position.start` and `position.end` must be >= 0');
      if (end <= start) throw new Error('`position.end` must be greater than `position.start`');
      return true;
    })
];

/**
 * Validation rules for feed creation/update
 */
const validateFeed = [
  body('url')
    .notEmpty()
    .withMessage('Feed URL is required')
    .isURL()
    .withMessage('Must be a valid URL'),
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title must be 200 characters or less')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or less')
    .trim()
];

/**
 * Validation rules for stack creation/update
 */
const validateStack = [
  body('name')
    .notEmpty()
    .withMessage('Stack name is required')
    .isLength({ max: 100 })
    .withMessage('Stack name must be 100 characters or less')
    .trim()
    .escape(),
  body('query')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Query must be 500 characters or less')
    .trim(),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object')
];

/**
 * Validation rules for user profile update
 */
const validateUserProfile = [
  body('displayName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Display name must be 100 characters or less')
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be 500 characters or less')
    .trim(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object')
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
];

/**
 * Validation rules for tag assignment to articles
 */
const validateTagAssignment = [
  body('tagId')
    .notEmpty()
    .withMessage('Tag ID is required')
    .isString()
    .withMessage('Tag ID must be a string')
];

/**
 * Middleware to handle validation errors
 * Should be placed after validation rules in route handlers
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

module.exports = { 
  validateRegistration, 
  validateLogin,
  validateArticle,
  validateTag,
  validateHighlight,
  // lightweight update validator allowing partial fields
  validateHighlightUpdate: [
    body('annotations')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined) return true;
        if (Array.isArray(value)) throw new Error('`annotations` must be a single object, not an array');
        if (typeof value !== 'object') throw new Error('`annotations` must be an object');
        if (value.title !== undefined && typeof value.title !== 'string') throw new Error('`annotations.title` must be a string');
        if (value.note !== undefined && typeof value.note !== 'string') throw new Error('`annotations.note` must be a string');
        if (value.title && value.title.length > 500) throw new Error('`annotations.title` must be 500 characters or less');
        if (value.note && value.note.length > 5000) throw new Error('`annotations.note` must be 5000 characters or less');
        return true;
      }),
    body('color')
      .optional()
      .trim()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex color (e.g., #FF5733)'),
    body('position')
      .optional()
      .custom((value) => {
        if (value === undefined) return true;
        if (typeof value !== 'object' || value === null) throw new Error('`position` must be an object');
        if (value.start === undefined || value.end === undefined) throw new Error('`position` must include start and end');
        const start = Number(value.start);
        const end = Number(value.end);
        if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error('`position.start` and `position.end` must be numbers');
        if (start < 0 || end < 0) throw new Error('`position.start` and `position.end` must be >= 0');
        if (end <= start) throw new Error('`position.end` must be greater than `position.start`');
        return true;
      })
  ],
  validateFeed,
  validateStack,
  validateUserProfile,
  validatePasswordChange,
  validateTagAssignment,
  handleValidationErrors 
};
