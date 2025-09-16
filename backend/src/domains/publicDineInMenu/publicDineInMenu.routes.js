import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import publicDineInMenuServiceFactory from "./publicDineInMenu.service.js";
import publicDineInMenuControllerFactory from "./publicDineInMenu.controller.js";

export default (db) => {
  const publicDineInMenuService = publicDineInMenuServiceFactory(db);
  const publicDineInMenuController = publicDineInMenuControllerFactory(
    publicDineInMenuService,
  );
  const router = express.Router();

  router.get(
    "/:restaurantSlug/:tableNumber",
    asyncHandler(publicDineInMenuController.getDineInMenu),
  );

  return router;
};
