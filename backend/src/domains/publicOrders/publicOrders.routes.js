import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { createPublicOrderValidation } from "./publicOrders.validation.js";
import publicOrdersServiceFactory from "./publicOrders.service.js";
import publicOrdersControllerFactory from "./publicOrders.controller.js";

export default (db) => {
  const publicOrdersService = publicOrdersServiceFactory(db);
  const publicOrdersController = publicOrdersControllerFactory(
    publicOrdersService,
  );
  const router = express.Router();

  router.post(
    "/",
    createPublicOrderValidation,
    asyncHandler(publicOrdersController.createPublicOrder),
  );

  return router;
};
