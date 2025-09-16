import redisClient from "../config/redisClient.js";
import logger from "../utils/logger.js";

class CacheService {
  constructor() {
    if (!redisClient) {
      logger.warn("Redis client not initialized. Caching will be disabled.");
    }
  }

  async get(key) {
    if (!redisClient) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Error getting key ${key} from Redis:`, error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 86400) {
    if (!redisClient) return;
    try {
      await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (error) {
      logger.error(`Error setting key ${key} in Redis:`, error);
    }
  }

  async delExact(key) {
    if (!redisClient) return 0;
    try {
      const result = await redisClient.del(key);
      return result;
    } catch (error) {
      logger.error(`Error deleting key ${key} from Redis:`, error);
      return 0;
    }
  }

  async delByPattern(pattern) {
    if (!redisClient) return 0;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        const result = await redisClient.del(keys);
        return result;
      }
      return 0;
    } catch (error) {
      logger.error(
        `Error deleting keys by pattern ${pattern} from Redis:`,
        error,
      );
      return 0;
    }
  }

  async publish(channel, message) {
    if (!redisClient) return;
    try {
      await redisClient.publish(channel, JSON.stringify(message));
    } catch (error) {
      logger.error(
        `Error publishing message to channel ${channel} in Redis:`,
        error,
      );
    }
  }
}

export default new CacheService();
