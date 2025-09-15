import redis from "redis";
import logger from "utils/logger"; // Import logger

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379", // Use environment variable for Redis URL
  socket: {
    connectTimeout: 10000, // 10 seconds timeout
  },
});

redisClient.on("connect", () => logger.info("Redis Client Connected"));
redisClient.on("error", (err) => logger.error("Redis Client Error", err));

// Connect to Redis
redisClient.connect();

export default redisClient;
