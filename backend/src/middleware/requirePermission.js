'use strict';
const iamService = require('../services/iamService');
const models = require('models'); // Ensure models are imported

const requirePermission = (featureKey, actionKey) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
      }

      // Bypass for Super Admin
      const user = await models.User.findByPk(userId);
      if (user && user.isSuperadmin) {
        return next();
      }

      // Restaurant context is required for non-superadmins
      const restaurantId = req.restaurant?.id || req.params.restaurantId || req.query.restaurant_id || req.user.restaurantId;
      if (!restaurantId) {
        return res.status(401).json({ error: 'Unauthorized: Missing restaurant context.' });
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
