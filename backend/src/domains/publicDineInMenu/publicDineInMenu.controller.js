module.exports = (publicDineInMenuService) => {
  const { validationResult } = require('express-validator');
  const { NotFoundError } = require('utils/errors');

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const getDineInMenu = async (req, res, next) => {
    try {
      const { restaurantSlug, tableNumber } = req.params;
      const { products, table, restaurant } = await publicDineInMenuService.getDineInMenu(restaurantSlug, tableNumber);
      res.json({ products, table, restaurant });
    } catch (error) {
      next(error);
    }
  };

  return {
    getDineInMenu,
  };
};