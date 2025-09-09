const rewardsServiceFactory = require('./rewards.service');
const rewardsControllerFactory = require('./rewards.controller');

module.exports = (db) => {
    const rewardsService = rewardsServiceFactory(db); // Pass db directly
    const rewardsController = rewardsControllerFactory(rewardsService);
    return {
        rewardsService,
        rewardsController
    };
};