const express = require('express');

module.exports = (db) => {
    const healthController = require('./health.controller')(db);
    const router = express.Router();

    router.get('/', healthController.getHealthStatus);

    return router;
};
