const express = require('express');

module.exports = (db, healthController) => {
    const router = express.Router();

    router.get('/', (req, res, next) => healthController.getHealthStatus(req, res, next));

    return router;
};