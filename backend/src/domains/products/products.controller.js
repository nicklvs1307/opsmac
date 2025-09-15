"use strict";
import { validationResult } from "express-validator";
import { BadRequestError } from "utils/errors";
import auditService from "services/auditService";

// Import the consolidated service factory function
import productServiceFactory from "./products.service";

class ProductsController {
  constructor(db) {
    this.productService = productServiceFactory(db);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async uploadProductImage(req, res, next) {
    try {
      this.handleValidationErrors(req);
      if (!req.file) {
        throw new BadRequestError("Nenhum arquivo de imagem enviado.");
      }
      const imageUrl = await this.productService.uploadProductImage(
        req.file.filename,
      );
      await auditService.log(
        req.user,
        req.context.restaurantId,
        "PRODUCT_IMAGE_UPLOADED",
        `Image:${req.file.filename}`,
        { imageUrl },
      );
      res.status(200).json({ imageUrl });
    } catch (error) {
      next(error);
    }
  }

  async getAllProducts(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { category_id, search } = req.query;
      const products = await this.productService.listProducts(
        restaurantId,
        category_id,
        search,
      );
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const product = await this.productService.createProduct(
        req.body,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "PRODUCT_CREATED",
        `Product:${product.id}`,
        { name: product.name, price: product.price },
      );
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const product = await this.productService.getProductById(
        req.params.id,
        restaurantId,
      );
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const product = await this.productService.updateProduct(
        req.params.id,
        restaurantId,
        req.body,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "PRODUCT_UPDATED",
        `Product:${product.id}`,
        { updatedData: req.body },
      );
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      await this.productService.deleteProduct(req.params.id, restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "PRODUCT_DELETED",
        `Product:${req.params.id}`,
        {},
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async toggleProductStatus(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const product = await this.productService.toggleProductStatus(
        req.params.id,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "PRODUCT_STATUS_TOGGLED",
        `Product:${product.id}`,
        { newStatus: product.is_active },
      );
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
}

export default (db) => new ProductsController(db);