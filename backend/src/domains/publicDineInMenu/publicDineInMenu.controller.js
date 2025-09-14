module.exports = (publicDineInMenuService) => {
  const { validationResult } = require("express-validator");
  const { BadRequestError } = require("utils/errors");

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const getDineInMenu = async (req, res, next) => {
    const { restaurantSlug, tableNumber } = req.params;
    const { products, table, restaurant } =
      await publicDineInMenuService.getDineInMenu(restaurantSlug, tableNumber);
    res.json({ products, table, restaurant });
  };

  return {
    getDineInMenu,
  };
};
