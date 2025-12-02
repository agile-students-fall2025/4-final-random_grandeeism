const { body, validationResult } = require('express-validator');

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .trim()
    .escape(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('displayName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Display name must be 100 characters or less')
    .trim()
];

/**
 * Validation rules for user login
 * Note: 'username' field accepts either username or email
 */
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for article creation/update
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
    .isLength({ max: 1000000 })
    .withMessage('Content too large'),
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
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color (e.g., #FF5733)')
];

/**
 * Validation rules for highlight creation/update
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
  body('note')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Note must be 5000 characters or less')
    .trim(),
  body('color')
    .optional()
    .isIn(['yellow', 'green', 'blue', 'pink', 'purple'])
    .withMessage('Invalid highlight color')
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
  validateFeed,
  validateStack,
  validateUserProfile,
  validatePasswordChange,
  validateTagAssignment,
  handleValidationErrors 
};
