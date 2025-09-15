const rewardsServiceFactory = require("./rewards.service");
const logger = require("utils/logger");
logger.debug(
  "DEBUG: rewards.module.js - rewardsServiceFactory:",
  rewardsServiceFactory,
);
const rewardsControllerFactory = require("./rewards.controller");
logger.debug(
  "DEBUG: rewards.module.js - rewardsControllerFactory:",
  rewardsControllerFactory,
);

module.exports = (db) => {
  logger.debug("DEBUG: rewards.module.js - received db:", db);
  const rewardsService = rewardsServiceFactory(db); // Pass db directly
  logger.debug("DEBUG: rewards.module.js - rewardsService:", rewardsService);
  const rewardsController = rewardsControllerFactory(rewardsService);
  logger.debug(
    "DEBUG: rewards.module.js - rewardsController:",
    rewardsController,
  );
  return {
    rewardsService,
    rewardsController,
  };
};
