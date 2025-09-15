"use strict";

const models = require("models");

class CategoriesService {
  async createCategory(name, restaurantId) {
    // Placeholder implementation
    return { id: "new-category-id", name, restaurantId, created: true };
  }

  async listCategories(restaurantId) {
    // Placeholder implementation
    return [{ id: "category-1", name: "Category 1", restaurantId }];
  }

  async getCategoryById(id, restaurantId) {
    // Placeholder implementation
    return { id, name: "Category Name", restaurantId };
  }

  async updateCategory(id, name, restaurantId) {
    // Placeholder implementation
    return { id, name, restaurantId, updated: true };
  }

  async deleteCategory(id, restaurantId) {
    // Placeholder implementation
    return { id, deleted: true };
  }

  async toggleCategoryStatus(id, restaurantId) {
    // Placeholder implementation
    return { id, statusToggled: true };
  }
}

module.exports = new CategoriesService();
