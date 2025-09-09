const rewardsServiceFactory = require('./rewards.service');
console.log('DEBUG: rewards.module.js - rewardsServiceFactory:', rewardsServiceFactory);
const rewardsControllerFactory = require('./rewards.controller');
console.log('DEBUG: rewards.module.js - rewardsControllerFactory:', rewardsControllerFactory);

module.exports = (db) => {
    console.log('DEBUG: rewards.module.js - received db:', db);
    const rewardsService = rewardsServiceFactory(db); // Pass db directly
    console.log('DEBUG: rewards.module.js - rewardsService:', rewardsService);
    const rewardsController = rewardsControllerFactory(rewardsService);
    console.log('DEBUG: rewards.module.js - rewardsController:', rewardsController);
    return {
        rewardsService,
        rewardsController
    };
};