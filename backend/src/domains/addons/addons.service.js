const { BadRequestError, NotFoundError } = require('utils/errors');

module.exports = (db) => {
        const models = db;

    const listAddons = async (restaurantId) => {
        return models.Addon.findAll({ where: { restaurantId: restaurantId } });
    };

    const createAddon = async (name, price, restaurantId) => {
        return models.Addon.create({ name, price, restaurantId: restaurantId });
    };

    const updateAddon = async (id, name, price) => {
        const addon = await models.Addon.findByPk(id);
        if (!addon) {
            throw new NotFoundError('Adicional não encontrado.');
        }
        await addon.update({ name, price });
        return addon;
    };

    const deleteAddon = async (id) => {
        const result = await models.Addon.destroy({ where: { id } });
        if (result === 0) {
            throw new NotFoundError('Adicional não encontrado.');
        }
    };

    const toggleAddonStatus = async (id) => {
        const addon = await models.Addon.findByPk(id);
        if (!addon) {
            throw new NotFoundError('Adicional não encontrado.');
        }
        await addon.update({ isActive: !addon.isActive });
        return addon;
    };

    return {
        listAddons,
        createAddon,
        updateAddon,
        deleteAddon,
        toggleAddonStatus,
    };
};
