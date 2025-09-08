'use strict';

const models = require('../../models');

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
      console.error('Error saving audit log:', error);
    }
  }
}

module.exports = new AuditService();