"use strict";

const models = require("../../models");
const { Op } = require("sequelize");

class OrdersService {
  async getAllOrders(restaurantId, status, platform, delivery_type, search) {
    // Placeholder implementation
    return [];
  }

  async updateOrderStatus(orderId, restaurantId, status) {
    // Placeholder implementation
    return { id: orderId, status, updated: true };
  }
}

module.exports = new OrdersService();
