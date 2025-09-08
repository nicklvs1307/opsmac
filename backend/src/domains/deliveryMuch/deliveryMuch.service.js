const { BadRequestError, ForbiddenError, NotFoundError } = require('utils/errors');

module.exports = (db) => {
    const models = db.models;

    const handleOrderCreated = async (orderData) => {
        const restaurantId = orderData.restaurantId;
        const localRestaurant = await models.Restaurant.findByPk(restaurantId);

        if (!localRestaurant) {
            console.warn(`Restaurante com ID ${restaurantId} do Delivery Much não encontrado no sistema.`);
            return;
        }

        let customerInstance = null;
        if (orderData.customer && orderData.customer.phone) {
            [customerInstance] = await models.Customer.findOrCreate({
                where: { phone: orderData.customer.phone, restaurantId: localRestaurant.id },
                defaults: {
                    name: orderData.customer.name || 'Cliente Delivery Much',
                    email: orderData.customer.email || null,
                    whatsapp: orderData.customer.phone,
                    restaurantId: localRestaurant.id,
                    source: 'delivery_much',
                },
            });
        }

        await models.Order.create({
            restaurantId: localRestaurant.id,
            customerId: customerInstance ? customerInstance.id : null,
            externalOrderId: orderData.id,
            platform: 'delivery_much',
            status: orderData.status,
            totalAmount: orderData.total_amount,
            deliveryFee: orderData.delivery_fee || 0,
            items: orderData.items,
            customerDetails: orderData.customer,
            orderDetails: orderData,
            orderDate: orderData.created_at,
            deliveryAddress: orderData.delivery_address,
            paymentMethod: orderData.payment_method,
            deliveryType: orderData.delivery_type,
            notes: orderData.notes,
        });
    };

    const handleOrderUpdated = async (orderData) => {
        const order = await models.Order.findOne({ where: { externalOrderId: orderData.id, platform: 'delivery_much' } });
        if (order) {
            await order.update({ status: orderData.status });
        } else {
            console.warn(`Pedido Delivery Much ${orderData.id} não encontrado para atualização de status.`);
        }
    };

    const processWebhookEvent = async (event) => {
        if (event.type === 'order.created') {
            await handleOrderCreated(event.data);
        } else if (event.type === 'order.updated') {
            await handleOrderUpdated(event.data);
        }
    };

    const getOrdersFromDb = async (restaurantId, status) => {
        const where = { restaurantId: restaurantId, platform: 'delivery_much' };
        if (status) where.status = status;
        return models.Order.findAll({ where });
    };

    const checkDeliveryMuchModuleEnabled = async (restaurantIdFromPayload, userId) => {
        let restaurantId = restaurantIdFromPayload;
        if (userId) {
            const user = await models.User.findByPk(userId, {
                include: [{ model: models.Restaurant, as: 'restaurants' }]
            });
            if (user && user.restaurants && user.restaurants[0]) {
                restaurantId = user.restaurants[0].id;
            }
        }

        if (!restaurantId) {
            throw new BadRequestError('ID do restaurante ausente. Não é possível verificar o módulo.');
        }

        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant || !restaurant.settings?.enabled_modules?.includes('delivery_much_integration')) {
            throw new ForbiddenError('Módulo Delivery Much não habilitado para este restaurante.');
        }
        return restaurant;
    };

    const handleWebhook = async (event) => {
        await processWebhookEvent(event);
    };

    const getOrders = async (userId, status) => {
        const user = await models.User.findByPk(userId, {
            include: [{ model: models.Restaurant, as: 'restaurants' }]
        });
        const restaurantId = user?.restaurants?.[0]?.id;
        if (!restaurantId) {
            throw new BadRequestError('Restaurante não encontrado para o usuário.');
        }
        return getOrdersFromDb(restaurantId, status);
    };

    return {
        checkDeliveryMuchModuleEnabled,
        handleWebhook,
        getOrders,
    };
};