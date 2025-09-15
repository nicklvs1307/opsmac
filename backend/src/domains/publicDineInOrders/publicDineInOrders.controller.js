import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors";
import auditService from "../../services/auditService";

export default (publicDineInOrdersService) => {
  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const createDineInOrder = async (req, res, next) => {
    handleValidationErrors(req);
    const { cartItems, sessionId, restaurant_id, table_id } = req.body;
    const order = await publicDineInOrdersService.createDineInOrder(
      cartItems,
      sessionId,
      restaurant_id,
      table_id,
    );
    await auditService.log(
      null,
      restaurant_id,
      "DINE_IN_ORDER_CREATED",
      `Order:${order.id}`,
      { table_id, sessionId, totalItems: cartItems.length },
    );
    res.status(201).json(order);
  };

  return {
    createDineInOrder,
  };
};