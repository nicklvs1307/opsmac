"use strict";
import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";

// Import service factory function
import addonsServiceFactory from "./addons.service.js";

class AddonsController {
  constructor(db) {
    this.addonsService = addonsServiceFactory(db);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async listAddons(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const addons = await this.addonsService.listAddons(restaurantId);
      res.json(addons);
    } catch (error) {
      next(error);
    }
  }

  async createAddon(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { name, price } = req.body;
      const newAddon = await this.addonsService.createAddon(
        name,
        price,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "ADDON_CREATED",
        `Addon:${newAddon.id}`,
        { name, price },
      );
      res.json(newAddon);
    } catch (error) {
      next(error);
    }
  }

  async updateAddon(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { id } = req.params;
      const { name, price } = req.body;
      const updatedAddon = await this.addonsService.updateAddon(
        id,
        name,
        price,
      );
      await auditService.log(
        req.user,
        req.context.restaurantId,
        "ADDON_UPDATED",
        `Addon:${updatedAddon.id}`,
        { name, price },
      );
      res.json(updatedAddon);
    } catch (error) {
      next(error);
    }
  }

  async deleteAddon(req, res, next) {
    try {
      const { id } = req.params;
      await this.addonsService.deleteAddon(id);
      await auditService.log(
        req.user,
        req.context.restaurantId,
        "ADDON_DELETED",
        `Addon:${id}`,
        {},
      );
      res.json({ message: "Addon removed" });
    } catch (error) {
      next(error);
    }
  }

  async toggleAddonStatus(req, res, next) {
    try {
      const { id } = req.params;
      const addon = await this.addonsService.toggleAddonStatus(id);
      await auditService.log(
        req.user,
        req.context.restaurantId,
        "ADDON_STATUS_TOGGLED",
        `Addon:${id}`,
        { newStatus: addon.is_active },
      );
      res.json({
        success: true,
        data: addon,
        message: "Status do addon atualizado com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default (db) => new AddonsController(db);