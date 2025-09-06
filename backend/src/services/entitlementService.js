'use strict';

const models = require('../../models');

class EntitlementService {
  async setEntitlement(restaurantId, entityType, entityId, status, source, metadata) {
    // Upsert logic: try to find and update, otherwise create
    const [entitlement, created] = await models.RestaurantEntitlement.findOrCreate({
      where: { restaurantId, entityType, entityId },
      defaults: { status, source, metadata },
    });

    if (!created) {
      entitlement.status = status;
      entitlement.source = source;
      entitlement.metadata = metadata || {};
      await entitlement.save();
    }
    return entitlement;
  }

  async removeEntitlement(restaurantId, entityType, entityId) {
    const result = await models.RestaurantEntitlement.destroy({ where: { restaurantId, entityType, entityId } });
    if (result === 0) {
      throw new Error('Entitlement not found.');
    }
  }
}

module.exports = new EntitlementService();
