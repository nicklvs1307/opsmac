const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const addonController = require('../controllers/addonController');

// Middleware to get the restaurant ID from the authenticated user
const getRestaurantId = (req, res, next) => {
  let restaurantId = req.user?.restaurants?.[0]?.id; // Default for owner/manager

  // If user is admin or super_admin, allow them to specify restaurant_id
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    restaurantId = req.query.restaurant_id || req.body.restaurant_id || restaurantId;
  }

  if (!restaurantId) {
    return res.status(400).json({ msg: 'Restaurant ID is required or user not associated with any restaurant.' });
  }
  req.restaurantId = restaurantId;

  next();
};

/**
 * @swagger
 * tags:
 *   name: Addons
 *   description: Management of product addons
 */

/**
 * @swagger
 * /api/addons:
 *   post:
 *     summary: Creates a new addon
 *     tags: [Addons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the addon
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Price of the addon
 *     responses:
 *       201:
 *         description: Addon created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       409:
 *         description: An addon with this name already exists for this restaurant
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  auth,
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  [
    body('name').notEmpty().withMessage('Addon name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  addonController.createAddon
);

/**
 * @swagger
 * /api/addons:
 *   get:
 *     summary: Lists all addons for the restaurant
 *     tags: [Addons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of addons
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  auth,
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  addonController.getAllAddons
);

/**
 * @swagger
 * /api/addons/{id}:
 *   get:
 *     summary: Gets an addon by ID
 *     tags: [Addons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the addon
 *     responses:
 *       200:
 *         description: Addon data
 *       404:
 *         description: Addon not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  auth,
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  addonController.getAddonById
);

/**
 * @swagger
 * /api/addons/{id}:
 *   put:
 *     summary: Updates an existing addon
 *     tags: [Addons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the addon
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Addon updated successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Addon not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       409:
 *         description: An addon with this name already exists for this restaurant
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  auth,
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  [
    body('name').optional().notEmpty().withMessage('Addon name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  addonController.updateAddon
);

/**
 * @swagger
 * /api/addons/{id}:
 *   delete:
 *     summary: Deletes an addon
 *     tags: [Addons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the addon
 *     responses:
 *       204:
 *         description: Addon deleted successfully
 *       404:
 *         description: Addon not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  auth,
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  addonController.deleteAddon
);

module.exports = router;