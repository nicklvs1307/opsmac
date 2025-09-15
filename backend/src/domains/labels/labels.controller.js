import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors";
import auditService from "../../services/auditService";

export default (labelsService) => {
  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const getLabelUsers = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const users = await labelsService.getLabelUsers(restaurantId);
    res.status(200).json(users);
  };

  const getLabelItems = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const items = await labelsService.getLabelItems(restaurantId);
    res.status(200).json(items);
  };

  const getStockCounts = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const data = await labelsService.getStockCounts(restaurantId);
    res.status(200).json(data);
  };

  const getProductions = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const data = await labelsService.getProductions(restaurantId);
    res.status(200).json(data);
  };

  const printLabel = async (req, res, next) => {
    handleValidationErrors(req);
    const {
      labelable_id,
      labelable_type,
      expiration_date,
      quantity_printed,
      lot_number,
    } = req.body;
    const restaurantId = req.context.restaurantId;
    await labelsService.printLabel(
      labelable_id,
      labelable_type,
      expiration_date,
      quantity_printed,
      lot_number,
      restaurantId,
      req.user.userId,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "LABEL_PRINTED",
      `Labelable:${labelable_type}:${labelable_id}`,
      { quantity_printed, lot_number },
    );
    res.status(200).json({ message: "Label printed successfully!" });
  };

  return {
    getLabelUsers,
    getLabelItems,
    getStockCounts,
    getProductions,
    printLabel,
  };
};