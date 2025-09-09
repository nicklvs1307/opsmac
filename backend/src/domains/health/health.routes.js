const express = require('express');

module.exports = (db) => {
    const healthController = require('domains/health/health.controller')(db);
    const router = express.Router();

    router.get('/', healthController.getHealthStatus);

    return router;
};
