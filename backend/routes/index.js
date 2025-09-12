const path = require("path");
const fs = require("fs");
const safeRouter = require("../src/utils/safeRouter");
const getRestaurantContextMiddleware = require('middleware/getRestaurantContextMiddleware');
const logger = require('utils/logger'); // Import logger

module.exports = (db) => {
    const router = safeRouter();
    const { auth } = require("../src/middleware/authMiddleware")(db); // Import auth middleware

    // Apply the restaurant context middleware globally to all routes handled by this router
    router.use(auth); // Apply authMiddleware globally
    const restaurantContextMiddleware = getRestaurantContextMiddleware();
    router.use(restaurantContextMiddleware); // Call it as a function to get the middleware

    const domainsDir = path.join(__dirname, "..", "src", "domains");

    for (const entry of fs.readdirSync(domainsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const name = entry.name;
        const routeFile = path.join(domainsDir, name, `${name}.routes.js`);
        if (fs.existsSync(routeFile)) {
            logger.info(`Attempting to load route file: ${routeFile}`); // Add this logging line
            // Pass the db object to the route module
            router.use(`/${name}`, require(routeFile)(db));
        }
    }

    // health check route
    router.get("/health", (req, res) => res.json({ ok: true }));

    return router;
};