const express = require('express');

module.exports = (db, healthController) => {
    const router = express.Router();

    router.get('/', healthController.getHealthStatus);

    return router;
};