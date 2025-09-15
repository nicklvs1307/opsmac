"use strict";

const models = require("models");

class TechnicalSpecificationsService {
  async createTechnicalSpecification(
    productId,
    recipeIngredients,
    restaurantId,
  ) {
    // Placeholder implementation
    return { id: "new-ts-id", productId, restaurantId, created: true };
  }

  async getTechnicalSpecificationByProductId(productId, restaurantId) {
    // Placeholder implementation
    return { productId, restaurantId, data: {} };
  }

  async updateTechnicalSpecification(
    productId,
    recipeIngredients,
    restaurantId,
  ) {
    // Placeholder implementation
    return { productId, restaurantId, updated: true };
  }

  async deleteTechnicalSpecification(productId, restaurantId) {
    // Placeholder implementation
    return { productId, restaurantId, deleted: true };
  }
}

module.exports = new TechnicalSpecificationsService();
