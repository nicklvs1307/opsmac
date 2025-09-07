'use strict';

const redisClient = require('../config/redisClient');
const CHANNEL = 'perm_invalidation';

// This worker subscribes to the invalidation channel and clears relevant cache keys.
// In a real-world scenario, this would be a separate process or microservice.

if (redisClient) {
  const subscriber = redisClient.duplicate();

  subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

  subscriber.on('message', (channel, message) => {
    if (channel === CHANNEL) {
      const { restaurantId } = JSON.parse(message);
      // console.log(`Received invalidation message for restaurant ${restaurantId}. Clearing cache.`);
      // Invalidate all snapshots for this restaurant
      redisClient.del(`perm_snapshot:${restaurantId}:*`)
        .then(res => { /* console.log(`Cleared ${res} keys for restaurant ${restaurantId}`) */ }) // Use the original redisClient for DEL
        .catch(err => console.error(`Error clearing cache for ${restaurantId}:`, err));
    }
  });

  subscriber.subscribe(CHANNEL, (err) => {
    if (err) {
      console.error('Failed to subscribe to Redis channel:', err);
    } else {
      // console.log(`Subscribed to Redis channel: ${CHANNEL}`);
    }
  });
} else {
  console.warn('Redis client not initialized. Invalidation job will not run.');
}
