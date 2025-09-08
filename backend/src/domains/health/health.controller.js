module.exports = (db) => {
    const healthService = require('./health.service')(db);

    const getHealthStatus = (req, res, next) => {
        try {
            const status = healthService.getHealthStatus();
            res.json(status);
        } catch (error) {
            next(error);
        }
    };

    return {
        getHealthStatus,
    };
};
