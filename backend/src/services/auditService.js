"use strict";

import models from "../../models/index.js";
import logger from "../utils/logger.js";

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

export default new AuditService();
