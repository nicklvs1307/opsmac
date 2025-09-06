'use strict';

const redisClient = require('../config/redisClient');

class CacheService {
  constructor() {
    if (!redisClient) {
      console.warn('Redis client not initialized. Caching will be disabled.');
    }
  }

  async get(key) {
    if (!redisClient) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttlSeconds = 86400) {
    if (!redisClient) return;
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(keyPattern) {
    if (!redisClient) return;
    const result = await redisClient.del(keyPattern);
    console.log(`CacheService: Deleted ${result} keys matching pattern ${keyPattern}`);
    return result;
  }

  async publish(channel, message) {
    if (!redisClient) return;
    await redisClient.publish(channel, JSON.stringify(message));
  }
}

module.exports = new CacheService();
