const redis = require("redis");
import logger from "utils/logger";
const cacheService = require("services/cacheService");

// Create a separate Redis client for subscription to avoid blocking other operations
const subscriberClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 10000,
  },
});

subscriberClient.on("connect", () =>
  logger.info("Redis Subscriber Client Connected"),
);
subscriberClient.on("error", (err) =>
  logger.error("Redis Subscriber Client Error", err),
);

const initCacheInvalidator = async () => {
  try {
    await subscriberClient.connect();
    await subscriberClient.subscribe("perm_invalidation", (message) => {
      logger.info(`Received message on perm_invalidation channel: ${message}`);
      try {
        const { restaurantId } = JSON.parse(message);
        if (restaurantId) {
          // Invalidate all permission snapshots for the given restaurantId
          cacheService.delByPattern(`perm_snapshot:${restaurantId}:*`);
          logger.info(
            `Invalidated permission cache for restaurantId: ${restaurantId}`,
          );
        }
      } catch (parseError) {
        logger.error("Error parsing perm_invalidation message:", parseError);
      }
    });
    logger.info("Subscribed to perm_invalidation channel.");
  } catch (error) {
    logger.error("Failed to initialize Redis Cache Invalidator:", error);
  }
};

module.exports = { initCacheInvalidator, subscriberClient };
