import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors/index.js";
import tablesServiceFactory from "./tables.service.js";

export default (db) => {
  const tablesService = tablesServiceFactory(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const createTable = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurant_id = req.context.restaurantId;
      const { table_number } = req.body;
      const table = await tablesService.createTable(
        restaurant_id,
        table_number,
      );
      res.status(201).json(table);
    } catch (error) {
      next(error);
    }
  };

  const listTables = async (req, res, next) => {
    try {
      const restaurant_id = req.context.restaurantId;
      const tables = await tablesService.listTables(restaurant_id);
      res.json(tables);
    } catch (error) {
      next(error);
    }
  };

  return {
    createTable,
    listTables,
  };
};
