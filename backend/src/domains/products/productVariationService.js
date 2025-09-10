const { NotFoundError } = require('utils/errors');

module.exports = (db) => {
    const models = db;

    const addProductVariation = async (productId, variationData) => {
        const product = await models.Product.findByPk(productId);
        if (!product) { throw new NotFoundError('Produto não encontrado.'); }
        const variation = await models.ProductVariation.create({ product_id: productId, ...variationData });
        return variation;
    };

    const updateProductVariation = async (variationId, updateData) => {
        const variation = await models.ProductVariation.findByPk(variationId);
        if (!variation) { throw new NotFoundError('Variação de produto não encontrada.'); }
        await variation.update(updateData);
        return variation;
    };

    const deleteProductVariation = async (variationId) => {
        const variation = await models.ProductVariation.findByPk(variationId);
        if (!variation) { throw new NotFoundError('Variação de produto não encontrada.'); }
        await variation.destroy();
    };

    const getProductVariations = async (productId) => {
        const product = await models.Product.findByPk(productId, { include: [{ model: models.ProductVariation, as: 'variations' }] });
        if (!product) { throw new NotFoundError('Produto não encontrado.'); }
        return product.variations;
    };

    return {
        addProductVariation,
        updateProductVariation,
        deleteProductVariation,
        getProductVariations,
    };
};