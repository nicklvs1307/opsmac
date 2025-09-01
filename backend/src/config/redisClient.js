const redis = require('redis');
const config = require('config/config'); // Assuming config.js holds Redis connection details

const redisClient = redis.createClient({
  url: config.redisUrl, // e.g., 'redis://localhost:6379'
});

redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis
redisClient.connect();

module.exports = redisClient;