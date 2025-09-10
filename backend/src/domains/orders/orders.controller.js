module.exports = (ordersService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const getAllOrders = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const { status, platform, delivery_type, search } = req.query;
    const orders = await ordersService.getAllOrders(restaurantId, status, platform, delivery_type, search);
    res.json(orders);
  };

  const updateOrderStatus = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const { id } = req.params;
    const { status } = req.body;
    const order = await ordersService.updateOrderStatus(id, restaurantId, status);
    res.json({ message: 'Status do pedido atualizado com sucesso!', order });
  };

  return {
    getAllOrders,
    updateOrderStatus,
  };
};