"use strict";
import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";

// Import service factory function
import categoriesServiceFactory from "./categories.service.js";

class CategoriesController {
  constructor(db) {
    this.categoriesService = categoriesServiceFactory(db);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async createCategory(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { name } = req.body;
      const restaurantId = req.context.restaurantId;
      const category = await this.categoriesService.createCategory(
        name,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "CATEGORY_CREATED",
        `Category:${category.id}`,
        { name },
      );
      res.status(201).json({
        success: true,
        data: category,
        message: "Categoria criada com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  }

  async listCategories(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const categories =
        await this.categoriesService.listCategories(restaurantId);
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const category = await this.categoriesService.getCategoryById(
        req.params.id,
        restaurantId,
      );
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { id } = req.params;
      const { name } = req.body;
      const restaurantId = req.context.restaurantId;
      const category = await this.categoriesService.updateCategory(
        id,
        name,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "CATEGORY_UPDATED",
        `Category:${category.id}`,
        { name },
      );
      res.json({
        success: true,
        data: category,
        message: "Categoria atualizada com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const restaurantId = req.context.restaurantId;
      await this.categoriesService.deleteCategory(id, restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "CATEGORY_DELETED",
        `Category:${id}`,
        {},
      );
      res
        .status(200)
        .json({ success: true, message: "Categoria removida com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  async toggleCategoryStatus(req, res, next) {
    try {
      const { id } = req.params;
      const restaurantId = req.context.restaurantId;
      const category = await this.categoriesService.toggleCategoryStatus(
        id,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "CATEGORY_STATUS_TOGGLED",
        `Category:${id}`,
        { newStatus: category.is_active },
      );
      res.json({
        success: true,
        data: category,
        message: "Status da categoria atualizado com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default (db) => new CategoriesController(db);