const healthService = require('./health.service');

exports.getHealthStatus = (req, res, next) => {
  try {
    const status = healthService.getHealthStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
};
