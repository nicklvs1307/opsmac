const { NotFoundError, BadRequestError } = require('utils/errors');

module.exports = (db) => {
    const models = db.models;

    const getRestaurantById = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId, {
            include: [{ model: models.Feature, as: 'features', attributes: ['id', 'name', 'description', 'path'] }]
        });
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        return restaurant;
    };

    const updateRestaurant = async (restaurantId, updateData) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        await restaurant.update(updateData);
        return restaurant;
    };

    const updateRestaurantStatus = async (restaurantId, statusData) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }
        await restaurant.update(statusData);
        return restaurant;
    };

    const listRestaurantUsers = async (restaurantId) => {
        return models.User.findAll({
            where: { restaurant_id: restaurantId },
            attributes: ['id', 'name', 'email', 'role', 'is_active']
        });
    };

    const createRestaurantUser = async (restaurantId, userData) => {
        const { name, email, password, role } = userData;
        if (!['manager', 'waiter'].includes(role)) {
            throw new BadRequestError('Função inválida. Permitido apenas: manager, waiter.');
        }
        return models.User.create({
            name,
            email,
            password,
            role,
            restaurant_id: restaurantId,
            is_active: true
        });
    };

    const updateRestaurantUser = async (restaurantId, userId, userData) => {
        const { name, email, role, is_active } = userData;
        if (role && !['manager', 'waiter'].includes(role)) {
            throw new BadRequestError('Função inválida. Permitido apenas: manager, waiter.');
        }
        const user = await models.User.findOne({ where: { id: userId, restaurant_id: restaurantId } });
        if (!user) {
            throw new NotFoundError('Usuário não encontrado neste restaurante.');
        }
        await user.update({ name, email, role, is_active });
        return user;
    };

    const deleteRestaurantUser = async (restaurantId, userId) => {
        const user = await models.User.findOne({ where: { id: userId, restaurant_id: restaurantId } });
        if (!user) {
            throw new NotFoundError('Usuário não encontrado neste restaurante.');
        }
        await user.destroy();
    };

    const getWaiterProducts = async (restaurantId) => {
        return models.Product.findAll({ where: { restaurant_id: restaurantId, is_active: true } });
    };

    const createWaiterOrder = async (restaurantId, orderData) => {
        const { table_id, items } = orderData;
        const total_amount = items.reduce((total, item) => total + item.price * item.quantity, 0);
        const external_order_id = `POS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        return models.Order.create({
            restaurant_id: restaurantId,
            table_id,
            items,
            status: 'pending',
            platform: 'other',
            order_date: new Date(),
            total_amount,
            external_order_id,
        });
    };

    const updateWaiterOrder = async (restaurantId, orderId, orderData) => {
        const { items, status } = orderData;
        const order = await models.Order.findOne({ where: { id: orderId, restaurant_id: restaurantId } });
        if (!order) {
            throw new NotFoundError('Pedido não encontrado neste restaurante.');
        }
        await order.update({ items, status });
        return order;
    };

    const getWaiterOrderById = async (restaurantId, orderId) => {
        const order = await models.Order.findOne({ where: { id: orderId, restaurant_id: restaurantId } });
        if (!order) {
            throw new NotFoundError('Pedido não encontrado neste restaurante.');
        }
        return order;
    };

    const getWaiterOrders = async (restaurantId) => {
        return models.Order.findAll({ where: { restaurant_id: restaurantId } });
    };

    const createWaiterCall = async (restaurantId, callData) => {
        const { table_id, call_type } = callData;
        return models.WaiterCall.create({
            restaurant_id: restaurantId,
            table_id,
            call_type,
            status: 'pending',
            call_time: new Date(),
        });
    };

    const updateWaiterCall = async (restaurantId, callId, callData) => {
        const { status } = callData;
        const call = await models.WaiterCall.findOne({ where: { id: callId, restaurant_id: restaurantId } });
        if (!call) {
            throw new NotFoundError('Chamado não encontrado neste restaurante.');
        }
        await call.update({ status });
        return call;
    };

    const getWaiterCalls = async (restaurantId) => {
        return models.WaiterCall.findAll({ where: { restaurant_id: restaurantId } });
    };

    const getWaiterCallById = async (restaurantId, callId) => {
        const call = await models.WaiterCall.findOne({ where: { id: callId, restaurant_id: restaurantId } });
        if (!call) {
            throw new NotFoundError('Chamado não encontrado neste restaurante.');
        }
        return call;
    };

    const deleteWaiterCall = async (restaurantId, callId) => {
        const call = await models.WaiterCall.findOne({ where: { id: callId, restaurant_id: restaurantId } });
        if (!call) {
            throw new NotFoundError('Chamado não encontrado neste restaurante.');
        }
        await call.destroy();
    };

    return {
        getRestaurantById,
        updateRestaurant,
        updateRestaurantStatus,
        listRestaurantUsers,
        createRestaurantUser,
        updateRestaurantUser,
        deleteRestaurantUser,
        getWaiterProducts,
        createWaiterOrder,
        updateWaiterOrder,
        getWaiterOrderById,
        getWaiterOrders,
        createWaiterCall,
        updateWaiterCall,
        getWaiterCalls,
        getWaiterCallById,
        deleteWaiterCall,
    };
};
