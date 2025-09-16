import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import ifoodControllerFactory from "./ifood.controller.js";

export default (db) => {
  const ifoodController = ifoodControllerFactory(db);
  const router = express.Router();

  // Rota para receber webhooks do iFood
  router.post("/webhook", asyncHandler(ifoodController.handleWebhook));

  return router;
};
