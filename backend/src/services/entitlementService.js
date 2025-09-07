'use strict';

const models = require('../../models');
const cacheService = require('./cacheService'); // Import cacheService

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

  async setEntitlements(restaurantId, entitlements) {
    const transaction = await models.sequelize.transaction();
    try {
      console.log(`[EntitlementService] Starting setEntitlements for restaurant: ${restaurantId}`);
      console.log(`[EntitlementService] Received restaurantId: ${restaurantId}`);
      console.log(`[EntitlementService] Received entitlements:`, JSON.stringify(entitlements, null, 2));
      console.log(`[EntitlementService] Entitlements to process: ${entitlements.length}`);

      // Clear existing entitlements for this restaurant
      console.log(`[EntitlementService] Destroying existing entitlements for restaurant: ${restaurantId}`);
      const destroyResult = await models.RestaurantEntitlement.destroy({ where: { restaurant_id: restaurantId }, transaction });
      console.log(`[EntitlementService] Destroyed ${destroyResult} existing entitlements.`);

      // Bulk insert new entitlements
      const newEntitlements = entitlements.map(ent => ({
        restaurantId: restaurantId,
        entityType: ent.entityType,
        entityId: ent.entityId,
        status: ent.status,
        source: ent.source,
        metadata: ent.metadata,
      }));

      if (newEntitlements.length > 0) {
        console.log(`[EntitlementService] Bulk creating ${newEntitlements.length} new entitlements.`);
        const bulkCreateResult = await models.RestaurantEntitlement.bulkCreate(newEntitlements, { transaction });
        console.log(`[EntitlementService] Bulk created ${bulkCreateResult.length} entitlements.`);
      } else {
        console.log(`[EntitlementService] No new entitlements to create.`);
      }

      console.log(`[EntitlementService] Committing transaction.`);
      await transaction.commit();
      console.log(`[EntitlementService] Transaction committed successfully.`);
      // Explicitly clear permission snapshots for this restaurant
      await cacheService.delByPattern(`perm_snapshot:${restaurantId}:*`);
      console.log(`[EntitlementService] Cleared permission snapshots for restaurant ${restaurantId}.`);
    } catch (error) {
      console.error(`[EntitlementService] Error in setEntitlements: ${error.name} - ${error.message}`, error.errors);
      console.log(`[EntitlementService] Rolling back transaction.`);
      await transaction.rollback();
      console.log(`[EntitlementService] Transaction rolled back.`);
      throw error; // This throw should cause the frontend mutation to fail
    }
  }
}

module.exports = new EntitlementService();
