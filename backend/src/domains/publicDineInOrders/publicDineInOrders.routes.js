import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { createDineInOrderValidation } from "./publicDineInOrders.validation.js";
import publicDineInOrdersServiceFactory from "./publicDineInOrders.service.js";
import publicDineInOrdersControllerFactory from "./publicDineInOrders.controller.js";

export default (db) => {
  const publicDineInOrdersService = publicDineInOrdersServiceFactory(db);
  const publicDineInOrdersController =
    publicDineInOrdersControllerFactory(publicDineInOrdersService);
  const router = express.Router();

  router.post(
    "/order",
    createDineInOrderValidation,
    asyncHandler(publicDineInOrdersController.createDineInOrder),
  );

  return router;
};
