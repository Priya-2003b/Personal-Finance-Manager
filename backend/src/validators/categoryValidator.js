const { body } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),

  // 🔥 NEW: type validation
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  // 🔥 NEW: budget validation
  body('budget')
    .optional()
    .isNumeric().withMessage('Budget must be a number')
    .custom((value) => value >= 0).withMessage('Budget cannot be negative')
];

const updateCategoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('budget')
    .optional()
    .isNumeric().withMessage('Budget must be a number')
    .custom((value) => value >= 0).withMessage('Budget cannot be negative')
];

module.exports = { createCategoryValidator, updateCategoryValidator };