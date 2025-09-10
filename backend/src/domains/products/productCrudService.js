const { NotFoundError } = require('utils/errors');

module.exports = (db) => {
    const models = db.models;

    const _findProductById = async (id, restaurantId, includeOptions = {}) => {
        const product = await models.Product.findOne({
            where: { id, restaurant_id: restaurantId },
            ...includeOptions
        });
        if (!product) {
            throw new NotFoundError('Produto não encontrado');
        }
        return product;
    };

    const createProduct = async (productData, restaurantId) => {
        const product = await models.Product.create({
            ...productData,
            restaurant_id: restaurantId,
        });
        return product;
    };

    const listProducts = async (restaurantId, category_id) => {
        let whereClause = { restaurant_id: restaurantId };
        if (category_id) {
            whereClause.category_id = category_id;
        }

        const products = await models.Product.findAll({
            where: whereClause,
            include: [{ model: models.Category, as: 'category', attributes: ['id', 'name'] }]
        });
        return products;
    };

    const getProductById = async (id, restaurantId) => {
        return _findProductById(id, restaurantId, {
            include: [
                { model: models.TechnicalSpecification, as: 'technicalSpecification' },
                { model: models.Category, as: 'category', attributes: ['id', 'name'] }
            ]
        });
    };

    const updateProduct = async (id, restaurantId, updateData) => {
        const product = await _findProductById(id, restaurantId);
        await product.update(updateData);
        return product;
    };

    const deleteProduct = async (id, restaurantId) => {
        const product = await _findProductById(id, restaurantId);
        await product.destroy();
    };

    const toggleProductStatus = async (id, restaurantId) => {
        const product = await _findProductById(id, restaurantId);
        product.is_active = !product.is_active;
        await product.save();
        return product;
    };

    return {
        createProduct,
        listProducts,
        getProductById,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
    };
};