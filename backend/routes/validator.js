// Expected format - adjust if yours differs
const { body } = require('express-validator');

module.exports = {
  registerValidator: [
    body('FullName').notEmpty().withMessage('Full name is required'),
    body('Password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('Email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('Region').notEmpty(),
    body('PhoneNumber').isString()
  ]
};