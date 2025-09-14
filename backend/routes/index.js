const path = require("path");
const fs = require("fs");
const safeRouter = require("../src/utils/safeRouter");
const getRestaurantContextMiddleware = require('middleware/getRestaurantContextMiddleware');

module.exports = (db) => {
    const mainRouter = safeRouter();
    const { auth } = require("../src/middleware/authMiddleware")(db);
    const restaurantContextMiddleware = getRestaurantContextMiddleware();

    // Apply restaurant context middleware after auth for private routes
    // mainRouter.use(restaurantContextMiddleware);

    // Define which domains are public and should not have the auth middleware applied
    const publicDomains = [
        'auth', 
        'public', 
        'publicV2', 
        'publicDineInMenu', 
        'publicDineInOrders', 
        'publicOrders', 
        'publicProducts', 
        'publicSurvey',
        'health'
    ];

    const domainsDir = path.join(__dirname, "..", "src", "domains");

    fs.readdirSync(domainsDir, { withFileTypes: true }).forEach(entry => {
        if (!entry.isDirectory()) return;

        const domainName = entry.name;
        const routeFile = path.join(domainsDir, domainName, `${domainName}.routes.js`);

        if (fs.existsSync(routeFile)) {
            const domainRouter = require(routeFile)(db);
            console.log(`DEBUG: Loading domain: ${domainName}, Router: ${!!domainRouter}`);
            
            if (publicDomains.includes(domainName)) {
                // Public routes: no auth middleware
                mainRouter.use(`/${domainName}`, domainRouter);
            } else {
                // Private routes: apply auth middleware
                mainRouter.use(`/${domainName}`, auth, restaurantContextMiddleware, domainRouter);
            }
        }
    });

    return mainRouter;
};