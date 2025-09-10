const { BadRequestError, ForbiddenError, NotFoundError } = require('utils/errors');

module.exports = (db) => {
    const models = db.models;

    const handleOrderCreated = async (orderData) => {
        const restaurantId = orderData.restaurant_id;
        const localRestaurant = await models.Restaurant.findByPk(restaurantId);

        if (!localRestaurant) {
            console.warn(`Restaurante com ID ${restaurantId} do Uai Rango não encontrado no sistema.`);
            return;
        }

        let customerInstance = null;
        if (orderData.customer && orderData.customer.phone) {
            [customerInstance] = await models.Customer.findOrCreate({
                where: { phone: orderData.customer.phone, restaurant_id: localRestaurant.id },
                defaults: {
                    name: orderData.customer.name || 'Cliente Uai Rango',
                    email: orderData.customer.email || null,
                    whatsapp: orderData.customer.phone,
                    restaurant_id: localRestaurant.id,
                    source: 'uai_rango',
                },
            });
        }

        await models.Order.create({
            restaurant_id: localRestaurant.id,
            customer_id: customerInstance ? customerInstance.id : null,
            external_order_id: orderData.id,
            platform: 'uai_rango',
            status: orderData.status,
            total_amount: orderData.total_amount,
            delivery_fee: orderData.delivery_fee || 0,
            items: orderData.items,
            customer_details: orderData.customer,
            order_details: orderData,
            order_date: orderData.created_at,
            delivery_address: orderData.delivery_address,
            payment_method: orderData.payment_method,
            delivery_type: orderData.delivery_type,
            notes: orderData.notes,
        });
    };

    const handleOrderUpdated = async (orderData) => {
        const order = await models.Order.findOne({ where: { external_order_id: orderData.id, platform: 'uai_rango' } });
        if (order) {
            await order.update({ status: orderData.status });
        } else {
            console.warn(`Pedido Uai Rango ${orderData.id} não encontrado para atualização de status.`);
        }
    };

    const processWebhookEventInternal = async (event) => {
        if (event.type === 'order.created') {
            await handleOrderCreated(event.data);
        } else if (event.type === 'order.updated') {
            await handleOrderUpdated(event.data);
        }
    };

    const getOrdersFromDb = async (restaurantId, status) => {
        const where = { restaurant_id: restaurantId, platform: 'uai_rango' };
        if (status) where.status = status;
        return models.Order.findAll({ where });
    };

    const checkUaiRangoModuleEnabled = async (restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant || !restaurant.settings?.enabled_modules?.includes('uai_rango_integration')) {
            throw new ForbiddenError('Módulo Uai Rango não habilitado para este restaurante.');
        }
        return restaurant;
    };

    const getOrders = async (restaurantId, status) => {
        if (!restaurantId) {
            throw new BadRequestError('Restaurante não encontrado para o usuário.');
        }
        return getOrdersFromDb(restaurantId, status);
    };

    return {
        checkUaiRangoModuleEnabled,
        processWebhookEventInternal,
        getOrders,
    };
};