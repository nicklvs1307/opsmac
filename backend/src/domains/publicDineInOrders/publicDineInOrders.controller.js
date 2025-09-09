module.exports = (publicDineInOrdersService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const createDineInOrder = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { cartItems, sessionId, restaurant_id, table_id } = req.body;
      const order = await publicDineInOrdersService.createDineInOrder(
        cartItems, sessionId, restaurant_id, table_id
      );
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  };

  return {
    createDineInOrder,
  };
};