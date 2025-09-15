"use strict";

const models = require("models");

class RewardsService {
  async getRewardById(id) {
    // Placeholder implementation
    return {
      id,
      name: "Sample Reward",
      description: "This is a sample reward.",
    };
  }
}

module.exports = new RewardsService();
