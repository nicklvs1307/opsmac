"use strict";

const models = require("../../models");
import logger from "#utils/logger"; // Import logger

class AuditService {
  async log(actor, tenantId, action, resource, payload) {
    try {
      await models.AuditLog.create({
        actorUserId: actor?.id,
        restaurantId: tenantId,
        action: action,
        resource: resource,
        payload: payload,
      });
    } catch (error) {
      logger.error("Error saving audit log:", error);
    }
  }
}

module.exports = new AuditService();
