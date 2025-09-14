"use strict";

const models = require("../../models");

class AddonsService {
  async listAddons(restaurantId) {
    // Placeholder implementation
    return [];
  }

  async createAddon(name, price, restaurantId) {
    // Placeholder implementation
    return { id: "new-addon-id", name, price, restaurantId, created: true };
  }

  async updateAddon(id, name, price) {
    // Placeholder implementation
    return { id, name, price, updated: true };
  }

  async deleteAddon(id) {
    // Placeholder implementation
    return { id, deleted: true };
  }

  async toggleAddonStatus(id) {
    // Placeholder implementation
    return { id, statusToggled: true };
  }
}

module.exports = new AddonsService();
