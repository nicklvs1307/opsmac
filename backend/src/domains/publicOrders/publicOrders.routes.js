import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createPublicOrderValidation } from "./publicOrders.validation";
import publicOrdersServiceFactory from "./publicOrders.service";
import publicOrdersControllerFactory from "./publicOrders.controller";

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