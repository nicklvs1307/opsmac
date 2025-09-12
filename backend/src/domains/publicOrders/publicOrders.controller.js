module.exports = (publicOrdersService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');
  const auditService = require('services/auditService'); // Import auditService

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const createPublicOrder = async (req, res, next) => {
    handleValidationErrors(req);
    const { restaurant_id, delivery_type, total_amount, items, customer_details, delivery_address, payment_method, notes } = req.body;
    const order = await publicOrdersService.createPublicOrder(
      restaurant_id, delivery_type, total_amount, items, customer_details, delivery_address, payment_method, notes
    );
    // No req.user for public routes, so pass null for user
    await auditService.log(null, restaurant_id, 'PUBLIC_ORDER_CREATED', `Order:${order.id}`, { delivery_type, total_amount, customer_details });
    res.status(201).json({ message: 'Pedido criado com sucesso!', orderId: order.id });
  };

  return {
    createPublicOrder,
  };
};
