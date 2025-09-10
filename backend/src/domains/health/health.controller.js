module.exports = (healthService) => {
    const getHealthStatus = (req, res, next) => {
        const status = healthService.getHealthStatus();
        res.json(status);
    };

    return {
        getHealthStatus,
    };
};