const { body } = require('express-validator');

exports.updateRestaurantStatusValidation = [
  body('is_open').isBoolean().withMessage('O campo is_open deve ser um booleano.')
];

exports.updateRestaurantPosStatusValidation = [
  body('pos_status').isIn(['open', 'closed']).withMessage("O campo pos_status deve ser 'open' ou 'closed'.")
];

exports.userValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('role').isIn(['manager', 'waiter']).withMessage('Função inválida. Permitido apenas: manager, waiter.')
];

exports.updateUserValidation = [
  body('name').optional().notEmpty().withMessage('Nome é obrigatório'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('role').optional().isIn(['manager', 'waiter']).withMessage('Função inválida. Permitido apenas: manager, waiter.'),
  body('is_active').optional().isBoolean().withMessage('is_active deve ser um booleano')
];

exports.addonValidation = [
  body('name').notEmpty().withMessage('Name is required.').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('description').optional().isString().withMessage('Description must be a string.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('is_active').isBoolean().withMessage('Is active must be a boolean.'),
];

exports.cashRegisterCategoryValidation = [
  body('name').notEmpty().withMessage('Category name is required.').isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters.'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense.'),
  body('is_active').isBoolean().withMessage('Is active must be a boolean.'),
];

exports.categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required.').isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters.'),
  body('description').optional().isString().withMessage('Description must be a string.'),
  body('is_active').isBoolean().withMessage('Is active must be a boolean.'),
];

exports.financialCategoryValidation = [
  body('name').notEmpty().withMessage('Category name is required.').isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters.'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense.'),
  body('is_active').isBoolean().withMessage('Is active must be a boolean.'),
];

exports.ingredientValidation = [
  body('name').notEmpty().withMessage('Ingredient name is required.').isLength({ min: 2, max: 100 }).withMessage('Ingredient name must be between 2 and 100 characters.'),
  body('unit_of_measure').notEmpty().withMessage('Unit of measure is required.'),
  body('is_active').isBoolean().withMessage('Is active must be a boolean.'),
];

exports.productValidation = [
  body('name').notEmpty().withMessage('Product name is required.').isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters.'),
  body('description').optional().isString().withMessage('Description must be a string.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID.'),
  body('is_active').isBoolean().withMessage('Is active must be a boolean.'),
];

exports.supplierValidation = [
  body('name').notEmpty().withMessage('Supplier name is required.').isLength({ min: 2, max: 100 }).withMessage('Supplier name must be between 2 and 100 characters.'),
  body('contact_person').optional().isString().withMessage('Contact person must be a string.'),
  body('phone').optional().isString().withMessage('Phone must be a string.'),
  body('email').optional().isEmail().withMessage('Invalid email format.'),
  body('address').optional().isString().withMessage('Address must be a string.'),
  body('is_active').isBoolean().withMessage('Is active must be a boolean.'),
];

exports.tableValidation = [
  body('name').notEmpty().withMessage('Table name is required.').isLength({ min: 1, max: 50 }).withMessage('Table name must be between 1 and 50 characters.'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer.'),
];

exports.technicalSpecificationValidation = [
  body('name').notEmpty().withMessage('Name is required.').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('description').optional().isString().withMessage('Description must be a string.'),
  body('is_active').isBoolean().withMessage('Is active must be a boolean.'),
];

exports.createWaiterOrderValidation = [
  body('table_id').notEmpty().withMessage('Table ID is required.'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item.'),
  body('items.*.product_id').notEmpty().withMessage('Product ID is required for each item.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer.'),
];

exports.updateWaiterOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item.').optional(),
  body('items.*.product_id').notEmpty().withMessage('Product ID is required for each item.').optional(),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer.').optional(),
  body('status').isIn(['pending', 'preparing', 'ready', 'delivered', 'cancelled']).withMessage('Invalid order status.').optional(),
];

exports.createWaiterCallValidation = [
  body('table_id').notEmpty().withMessage('Table ID is required.'),
  body('call_type').isIn(['service', 'bill', 'other']).withMessage('Invalid call type.'),
];

exports.updateWaiterCallValidation = [
  body('status').isIn(['pending', 'resolved', 'cancelled']).withMessage('Invalid call status.'),
];