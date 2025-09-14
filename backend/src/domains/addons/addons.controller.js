module.exports = (db) => {
  const addonsService = require("./addons.service")(db);
  const { validationResult } = require("express-validator");
  const { BadRequestError } = require("utils/errors");
  const auditService = require("services/auditService"); // Import auditService

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const listAddons = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const addons = await addonsService.listAddons(restaurantId);
    res.json(addons);
  };

  const createAddon = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const { name, price } = req.body;
    const newAddon = await addonsService.createAddon(name, price, restaurantId);
    await auditService.log(
      req.user,
      restaurantId,
      "ADDON_CREATED",
      `Addon:${newAddon.id}`,
      { name, price },
    );
    res.json(newAddon);
  };

  const updateAddon = async (req, res, next) => {
    handleValidationErrors(req);
    const { id } = req.params;
    const { name, price } = req.body;
    const updatedAddon = await addonsService.updateAddon(id, name, price);
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "ADDON_UPDATED",
      `Addon:${updatedAddon.id}`,
      { name, price },
    );
    res.json(updatedAddon);
  };

  const deleteAddon = async (req, res, next) => {
    const { id } = req.params;
    await addonsService.deleteAddon(id);
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "ADDON_DELETED",
      `Addon:${id}`,
      {},
    );
    res.json({ message: "Addon removed" });
  };

  const toggleAddonStatus = async (req, res, next) => {
    const { id } = req.params;
    const addon = await addonsService.toggleAddonStatus(id);
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "ADDON_STATUS_TOGGLED",
      `Addon:${id}`,
      { newStatus: addon.is_active },
    );
    res.json({
      success: true,
      data: addon,
      message: "Status do addon atualizado com sucesso.",
    });
  };

  return {
    listAddons,
    createAddon,
    updateAddon,
    deleteAddon,
    toggleAddonStatus,
  };
};
