const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379', // Use environment variable for Redis URL
});

redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis
redisClient.connect();

module.exports = redisClient;