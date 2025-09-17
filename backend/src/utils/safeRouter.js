import express from "express";
const METHODS = ["get", "post", "put", "patch", "delete", "all"];

function safeRouter() {
  const router = express.Router();
  for (const m of METHODS) {
    const orig = router[m].bind(router);
    router[m] = (path, ...handlers) => {
      handlers.forEach((h, i) => {
        if (typeof h !== "function") {
          throw new Error(
            `Router.${m}("${path}") handler[${i}] é ${typeof h}; expected function`,
          );
        }
      });
      return orig(path, ...handlers);
    };
  }
  return router;
}

export default safeRouter;
