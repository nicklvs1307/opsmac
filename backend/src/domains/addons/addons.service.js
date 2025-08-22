const { models } = require('../../config/database');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

exports.listAddons = async (restaurantId) => {
  const addons = await models.Addon.findAll({ where: { restaurant_id: restaurantId } });
  return addons;
};

exports.createAddon = async (name, price, restaurantId) => {
  const newAddon = await models.Addon.create({ name, price, restaurant_id: restaurantId });
  return newAddon;
};

exports.updateAddon = async (id, name, price) => {
  const addon = await models.Addon.findByPk(id);
  if (!addon) {
    throw new NotFoundError('Adicional não encontrado.');
  }
  await addon.update({ name, price });
  return addon;
};

exports.deleteAddon = async (id) => {
  const result = await models.Addon.destroy({ where: { id } });
  if (result === 0) {
    throw new NotFoundError('Adicional não encontrado.');
  }
};

exports.toggleAddonStatus = async (id) => {
  const addon = await models.Addon.findByPk(id);
  if (!addon) {
    throw new NotFoundError('Adicional não encontrado.');
  }
  await addon.update({ is_active: !addon.is_active });
  return addon;
};
