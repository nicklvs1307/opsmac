"use strict";

const models = require("../../models");
const cacheService = require("./cacheService"); // Import cacheService

class EntitlementService {
  async setEntitlement(
    restaurantId,
    entityType,
    entityId,
    status,
    source,
    metadata,
  ) {
    // Upsert logic: try to find and update, otherwise create
    const [entitlement, created] =
      await models.RestaurantEntitlement.findOrCreate({
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
    const result = await models.RestaurantEntitlement.destroy({
      where: { restaurantId, entityType, entityId },
    });
    if (result === 0) {
      throw new Error("Entitlement not found.");
    }
  }

  async setEntitlements(restaurantId, entitlements) {
    const transaction = await models.sequelize.transaction();
    try {
      // Clear existing entitlements for this restaurant

      const destroyResult = await models.RestaurantEntitlement.destroy({
        where: { restaurant_id: restaurantId },
        transaction,
      });

      // Bulk insert new entitlements
      const newEntitlements = entitlements.map((ent) => ({
        restaurantId: ent.restaurantId || restaurantId, // Ensure restaurantId is correctly assigned
        entityType: ent.entityType,
        entityId: ent.entityId,
        status: ent.status,
        source: ent.source,
        metadata: ent.metadata,
      }));

      if (newEntitlements.length > 0) {
        const bulkCreateResult = await models.RestaurantEntitlement.bulkCreate(
          newEntitlements,
          { transaction },
        );
      }

      await transaction.commit();

      // Explicitly clear permission snapshots for this restaurant
      await cacheService.delByPattern(`perm_snapshot:${restaurantId}:*`);
    } catch (error) {
      console.error(
        `[EntitlementService] Error in setEntitlements: ${error.name} - ${error.message} - Details:`,
        error.errors,
        error,
      );

      if (transaction) {
        // Defensive check
        await transaction.rollback();
      } else {
        console.error(
          `[EntitlementService] Transaction object was undefined, cannot rollback.`,
        );
      }

      throw error;
    }
  }
}

module.exports = new EntitlementService();
