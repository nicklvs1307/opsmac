const { NotFoundError } = require('utils/errors');

module.exports = (db) => {
    const models = db.models;

    const addProductAddon = async (productId, addonId) => {
        const product = await models.Product.findByPk(productId);
        const addon = await models.Addon.findByPk(addonId);
        if (!product || !addon) { throw new NotFoundError('Produto ou adicional não encontrado.'); }
        await product.addAddon(addon);
        return product;
    };

    const removeProductAddon = async (productId, addonId) => {
        const product = await models.Product.findByPk(productId);
        const addon = await models.Addon.findByPk(addonId);
        if (!product || !addon) { throw new NotFoundError('Produto ou adicional não encontrado.'); }
        await product.removeAddon(addon);
        return product;
    };

    const getProductAddons = async (productId) => {
        const product = await models.Product.findByPk(productId, { include: [{ model: models.Addon, as: 'addons' }] });
        if (!product) { throw new NotFoundError('Produto não encontrado.'); }
        return product.addons;
    };

    return {
        addProductAddon,
        removeProductAddon,
        getProductAddons,
    };
};