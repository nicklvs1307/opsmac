"use strict";
const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService");

// Import service factory functions
const productCrudServiceFactory = require("./productCrudService");
const productImageServiceFactory = require("./productImageService");
const productAddonServiceFactory = require("./productAddonService");
const productVariationServiceFactory = require("./productVariationService");

class ProductsController {
  constructor(db) {
    // Initialize services, passing db where required
    this.productCrudService = productCrudServiceFactory(db);
    this.productImageService = productImageServiceFactory(); // No db needed
    this.productAddonService = productAddonServiceFactory(db);
    this.productVariationService = productVariationServiceFactory(db);
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
      const imageUrl = await this.productImageService.uploadProductImage(
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
      const products = await this.productCrudService.listProducts(
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
      const product = await this.productCrudService.createProduct(
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

  async listProducts(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { category_id } = req.query;
      const products = await this.productCrudService.listProducts(
        restaurantId,
        category_id,
      );
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const product = await this.productCrudService.getProductById(
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
      const product = await this.productCrudService.updateProduct(
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
      await this.productCrudService.deleteProduct(req.params.id, restaurantId);
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
      const product = await this.productCrudService.toggleProductStatus(
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

module.exports = (db) => new ProductsController(db);
