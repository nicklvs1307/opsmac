import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createDineInOrderValidation } from "./publicDineInOrders.validation";
import publicDineInOrdersServiceFactory from "./publicDineInOrders.service";
import publicDineInOrdersControllerFactory from "./publicDineInOrders.controller";

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