"use strict";

const models = require("../../models");

class TablesService {
  async createTable(restaurantId, tableNumber) {
    // Placeholder implementation
    return { id: "new-table-id", restaurantId, tableNumber, created: true };
  }

  async listTables(restaurantId) {
    // Placeholder implementation
    return [{ id: "table-1", restaurantId, tableNumber: 1 }];
  }
}

module.exports = new TablesService();
