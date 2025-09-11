const express = require("express");
const METHODS = ["get", "post", "put", "patch", "delete", "all", "use"];

function safeRouter() {
  const router = express.Router();
  for (const m of METHODS) {
    const orig = router[m].bind(router);
    router[m] = (...args) => {
      let path = undefined;
      let handlers = args;

      if (m === 'use' && typeof args[0] === 'string') {
        path = args[0];
        handlers = args.slice(1);
      } else if (m !== 'use' && typeof args[0] === 'string') {
        path = args[0];
        handlers = args.slice(1);
      } else {
        // If it's 'use' and the first arg is not a string, it's a middleware function without a path
        // For other methods, if the first arg is not a string, it's an error (handled by Express itself)
        handlers = args;
      }

      handlers.forEach((h, i) => {
        if (typeof h !== "function") {
          throw new Error(`Router.${m}(${path ? `"${path}"` : ''}) handler[${i}] é ${typeof h}; expected function`);
        }
      });

      if (path !== undefined) {
        return orig(path, ...handlers);
      } else {
        return orig(...handlers);
      }
    };
  }
  return router;
}

module.exports = safeRouter;