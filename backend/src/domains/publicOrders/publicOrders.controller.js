import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors";
import auditService from "../../services/auditService";

export default (publicOrdersService) => {
  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const createPublicOrder = async (req, res, next) => {
    handleValidationErrors(req);
    const {
      restaurant_id,
      delivery_type,
      total_amount,
      items,
      customer_details,
      delivery_address,
      payment_method,
      notes,
    } = req.body;
    const order = await publicOrdersService.createPublicOrder(
      restaurant_id,
      delivery_type,
      total_amount,
      items,
      customer_details,
      delivery_address,
      payment_method,
      notes,
    );
    await auditService.log(
      null,
      restaurant_id,
      "PUBLIC_ORDER_CREATED",
      `Order:${order.id}`,
      { delivery_type, total_amount, customer_details },
    );
    res
      .status(201)
      .json({ message: "Pedido criado com sucesso!", orderId: order.id });
  };

  return {
    createPublicOrder,
  };
};