'use strict';
const iamService = require('../services/iamService');

const requirePermission = (featureKey, actionKey) => {
  return async (req, res, next) => {
    try {
      // Assuming userId is on req.user and restaurantId is on req.restaurant or req.params
      const userId = req.user?.id;
      const restaurantId = req.restaurant?.id || req.params.restaurantId;

      if (!userId || !restaurantId) {
        return res.status(401).json({ error: 'Unauthorized: Missing user or restaurant context.' });
      }

      const result = await iamService.checkPermission(restaurantId, userId, featureKey, actionKey);

      if (result.allowed) {
        return next();
      }

      if (result.locked) {
        return res.status(402).json({ error: 'Payment Required: Feature is locked', reason: result.reason });
      } else {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action.', reason: result.reason });
      }

    } catch (error) {
      console.error('Error in requirePermission middleware:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

module.exports = requirePermission;
