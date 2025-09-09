module.exports = (addonsService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const listAddons = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const addons = await addonsService.listAddons(restaurantId);
      res.json(addons);
    } catch (error) {
      next(error);
    }
  };

  const createAddon = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { name, price } = req.body;
      const newAddon = await addonsService.createAddon(name, price, restaurantId);
      res.json(newAddon);
    } catch (error) {
      next(error);
    }
  };

  const updateAddon = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { id } = req.params;
      const { name, price } = req.body;
      const updatedAddon = await addonsService.updateAddon(id, name, price);
      res.json(updatedAddon);
    } catch (error) {
      next(error);
    }
  };

  const deleteAddon = async (req, res, next) => {
    try {
      const { id } = req.params;
      await addonsService.deleteAddon(id);
      res.json({ message: 'Addon removed' });
    } catch (error) {
      next(error);
    }
  };

  const toggleAddonStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const addon = await addonsService.toggleAddonStatus(id);
      res.json(addon);
    } catch (error) {
      next(error);
    }
  };

  return {
    listAddons,
    createAddon,
    updateAddon,
    deleteAddon,
    toggleAddonStatus,
  };
};