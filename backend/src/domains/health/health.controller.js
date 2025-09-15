"use strict";

class HealthController {
  constructor(healthService) {
    this.healthService = healthService;
  }

  getHealthStatus(req, res, next) {
    try {
      const status = this.healthService.getHealthStatus();
      res.json(status);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = (healthService) => new HealthController(healthService);
