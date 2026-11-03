// backend/validators/authValidator.js
const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
      });
    }
    next();
  },
];

const validateLogin = [
  body('login').trim().notEmpty().withMessage('Email or phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
      });
    }
    next();
  },
];

module.exports = { validateRegister, validateLogin };
