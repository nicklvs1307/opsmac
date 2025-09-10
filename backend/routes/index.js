const path = require("path");
const fs = require("fs");
const safeRouter = require("../src/utils/safeRouter");

// Import services and controllers for specific domains
const categoriesService = require('../src/services/categoriesService');
const categoriesController = require('../src/domains/categories/categories.controller')(categoriesService);
const ordersService = require('../src/services/ordersService');
const ordersController = require('../src/domains/orders/orders.controller')(ordersService);
const rewardsService = require('../src/services/rewardsService');
const rewardsController = require('../src/domains/rewards/rewards.controller')(rewardsService);
const technicalSpecificationsService = require('../src/services/technicalSpecificationsService');
const technicalSpecificationsController = require('../src/domains/technicalSpecifications/technicalSpecifications.controller')(technicalSpecificationsService);

module.exports = (db) => {
    const router = safeRouter();
    const domainsDir = path.join(__dirname, "..", "src", "domains");

    // Explicitly load categories routes with its controller
    router.use('/categories', require(path.join(domainsDir, 'categories', 'categories.routes.js'))(db, categoriesController));
    // Explicitly load orders routes with its controller
    router.use('/orders', require(path.join(domainsDir, 'orders', 'orders.routes.js'))(db, ordersController));
    // Explicitly load rewards routes with its controller
    router.use('/rewards', require(path.join(domainsDir, 'rewards', 'rewards.routes.js'))(db, rewardsController));
    // Explicitly load technicalSpecifications routes with its controller
    router.use('/technicalSpecifications', require(path.join(domainsDir, 'technicalSpecifications', 'technicalSpecifications.routes.js'))(db, technicalSpecificationsController));

    for (const entry of fs.readdirSync(domainsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const name = entry.name;
        // Skip categories, orders, rewards and technicalSpecifications as they are loaded explicitly
        if (name === 'categories' || name === 'orders' || name === 'rewards' || name === 'technicalSpecifications') continue;
        const routeFile = path.join(domainsDir, name, `${name}.routes.js`);
        if (fs.existsSync(routeFile)) {
            // Pass the db object to the route module
            router.use(`/${name}`, require(routeFile)(db));
        }
    }

    // health check route
    router.get("/health", (req, res) => res.json({ ok: true }));

    return router;
};