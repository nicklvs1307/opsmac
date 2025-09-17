import path from "path";
import fs from "fs/promises";
import { fileURLToPath, pathToFileURL } from "url";
import safeRouter from "../src/utils/safeRouter.js";
import getRestaurantContextMiddleware from "../src/middleware/getRestaurantContextMiddleware.js";
import authMiddleware from "../src/middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (db) => {
  const mainRouter = safeRouter();
  const { auth } = authMiddleware(db);
  const restaurantContextMiddleware = getRestaurantContextMiddleware();

  const publicDomains = [
    "auth",
    "public",
    "publicV2",
    "publicDineInMenu",
    "publicDineInOrders",
    "publicOrders",
    "publicProducts",
    "publicSurvey",
    "health",
  ];

  const domainsDir = path.join(__dirname, "..", "src", "domains");

  const entries = await fs.readdir(domainsDir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isDirectory()) return;

      const domainName = entry.name;
      const routeFile = path.join(
        domainsDir,
        domainName,
        `${domainName}.routes.js`,
      );

      try {
        await fs.access(routeFile);
        const routeURL = pathToFileURL(routeFile).href;
        const { default: domainRouterFactory } = await import(routeURL);
        const domainRouter = domainRouterFactory(db);

        if (publicDomains.includes(domainName)) {
          mainRouter.use(`/${domainName}`, domainRouter);
        } else {
          mainRouter.use(
            `/${domainName}`,
            auth,
            restaurantContextMiddleware,
            domainRouter,
          );
        }
      } catch (error) {
        // If the route file doesn't exist, we can just ignore it.
        if (error.code !== "ENOENT") {
          console.error(
            `Error loading routes for domain '${domainName}':`,
            error,
          );
        }
      }
    }),
  );

  return mainRouter;
};
