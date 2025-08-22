const { body, query } = require('express-validator');

exports.openSessionValidation = [
  body('opening_cash').isFloat({ min: 0 }).withMessage('Opening cash must be a positive number.'),
  body('opening_observations').optional().isString().withMessage('Observations must be a string.'),
];

exports.recordMovementValidation = [
  body('session_id').isUUID().withMessage('Session ID is required and must be a valid UUID.'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number.'),
  body('category_id').optional().isUUID().withMessage('Category ID is required and must be a valid UUID.'),
  body('observations').optional().isString().withMessage('Observations must be a string.'),
];

exports.closeSessionValidation = [
  body('session_id').isUUID().withMessage('Session ID is required and must be a valid UUID.'),
  body('closing_cash').isFloat({ min: 0 }).withMessage('Closing cash must be a positive number.'),
  body('closing_observations').optional().isString().withMessage('Observations must be a string.'),
];
