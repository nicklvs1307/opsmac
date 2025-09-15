import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import publicDineInMenuServiceFactory from "./publicDineInMenu.service";
import publicDineInMenuControllerFactory from "./publicDineInMenu.controller";

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