const { body, validationResult } = require('express-validator');

/**
 * Validation middleware to check for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validate
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Validation rules for MOU data
 */
const mouValidation = [
  body('AcademicYear')
    .optional()
    .isString()
    .trim()
    .withMessage('Academic Year must be a string'),
  body('FacultyName')
    .optional()
    .isString()
    .trim()
    .withMessage('Faculty Name must be a string'),
  body('Duration')
    .optional()
    .isString()
    .trim()
    .withMessage('Duration must be a string'),
  body('Institute')
    .optional()
    .isString()
    .trim()
    .withMessage('Institute must be a string'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  mouValidation,
  validate
};
