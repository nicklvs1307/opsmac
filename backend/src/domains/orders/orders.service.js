const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('utils/errors');

module.exports = (db) => {
    const models = db;

    const getAllOrders = async (restaurantId, status, platform, delivery_type, search) => {
        const whereClause = {
            restaurant_id: restaurantId,
        };

        if (status) {
            whereClause.status = status;
        }
        if (platform) {
            whereClause.platform = platform;
        }
        if (delivery_type) {
            whereClause.delivery_type = delivery_type;
        }
        if (search) {
            whereClause[Op.or] = [
                { 'customer_details.name': { [Op.iLike]: `%${search}%` } },
                { 'customer_details.phone': { [Op.iLike]: `%${search}%` } },
                { 'external_order_id': { [Op.iLike]: `%${search}%` } },
            ];
        }

        const orders = await models.Order.findAll({
            where: whereClause,
            order: [['order_date', 'DESC']],
            limit: 50,
        });
        return orders;
    };

    const updateOrderStatus = async (id, restaurantId, status) => {
        const order = await models.Order.findOne({
            where: {
                id,
                restaurant_id: restaurantId,
            },
        });

        if (!order) {
            throw new NotFoundError('Pedido não encontrado ou não pertence ao seu restaurante.');
        }

        const validStatuses = ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled', 'concluded', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new BadRequestError('Status inválido.');
        }

        order.status = status;
        await order.save();

        return order;
    };

    return {
        getAllOrders,
        updateOrderStatus,
    };
};