const { body, query } = require('express-validator');

exports.openSessionValidation = [
  body('openingCash').isFloat({ min: 0 }).withMessage('Opening cash must be a positive number.'),
  body('openingObservations').optional().isString().withMessage('Observations must be a string.'),
];

exports.recordMovementValidation = [
  body('sessionId').isUUID().withMessage('Session ID is required and must be a valid UUID.'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number.'),
  body('categoryId').optional().isUUID().withMessage('Category ID is required and must be a valid UUID.'),
  body('observations').optional().isString().withMessage('Observations must be a string.'),
];

exports.closeSessionValidation = [
  body('sessionId').isUUID().withMessage('Session ID is required and must be a valid UUID.'),
  body('closingCash').isFloat({ min: 0 }).withMessage('Closing cash must be a positive number.'),
  body('closingObservations').optional().isString().withMessage('Observations must be a string.'),
];
