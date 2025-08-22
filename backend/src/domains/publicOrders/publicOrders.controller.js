const publicOrdersService = require('./publicOrders.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.createPublicOrder = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { restaurant_id, delivery_type, total_amount, items, customer_details, delivery_address, payment_method, notes } = req.body;
    const order = await publicOrdersService.createPublicOrder(
      restaurant_id, delivery_type, total_amount, items, customer_details, delivery_address, payment_method, notes
    );
    res.status(201).json({ message: 'Pedido criado com sucesso!', orderId: order.id });
  } catch (error) {
    next(error);
  }
};
