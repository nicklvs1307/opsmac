const { BadRequestError, ForbiddenError } = require('utils/errors');
const { Op } = require('sequelize');

module.exports = (db) => {
    const models = db.models;

    // Moved from backend/services/ifoodService.js
    async function handleOrderPlaced(payload, correlationId) {
        const { orderId, restaurantId, createdAt, totalAmount, deliveryFee, customer, items, deliveryAddress, paymentMethod, orderType, notes } = payload;

        try {
            const localRestaurant = await models.Restaurant.findOne({ where: { id: restaurantId } });
            if (!localRestaurant) {
                console.warn(`Restaurante com ID ${restaurantId} do iFood não encontrado no sistema.`);
                return;
            }

            let customerInstance = null;
            if (customer && customer.phone) {
                customerInstance = await models.Customer.findOrCreate({
                    where: { phone: customer.phone, restaurant_id: localRestaurant.id },
                    defaults: {
                        name: customer.name || 'Cliente iFood',
                        email: customer.email || null,
                        whatsapp: customer.phone,
                        restaurant_id: localRestaurant.id,
                        source: 'ifood',
                    },
                });
                customerInstance = customerInstance[0];
            }

            await models.Order.create({
                restaurant_id: localRestaurant.id,
                customer_id: customerInstance ? customerInstance.id : null,
                external_order_id: orderId,
                platform: 'ifood',
                status: 'pending',
                total_amount: totalAmount,
                delivery_fee: deliveryFee,
                items: items,
                customer_details: customer,
                order_details: payload,
                order_date: createdAt,
                delivery_address: deliveryAddress,
                payment_method: paymentMethod,
                delivery_type: orderType,
                notes: notes,
            });



        } catch (error) {
            console.error(`Erro ao processar ORDER_PLACED para o pedido ${orderId}:`, error);
            throw error;
        }
    }

    // Moved from backend/services/ifoodService.js
    async function handleOrderStatusUpdate(orderId, newStatus) {
        try {
            const order = await models.Order.findOne({ where: { external_order_id: orderId, platform: 'ifood' } });
            if (order) {
                await order.update({ status: newStatus });

            } else {
                console.warn(`Pedido iFood ${orderId} não encontrado para atualização de status.`);
            }
        } catch (error) {
            console.error(`Erro ao atualizar status do pedido ${orderId} para ${newStatus}:`, error);
            throw error;
        }
    }

    // Moved from backend/services/ifoodService.js and integrated
    async function processWebhookEventInternal(event) {
        switch (event.code) {
            case 'ORDER_PLACED':
                await handleOrderPlaced(event.payload, event.correlationId);
                break;
            case 'ORDER_CONFIRMED':
                await handleOrderStatusUpdate(event.payload.orderId, 'accepted');
                break;
            case 'ORDER_READY_FOR_DELIVERY':
                await handleOrderStatusUpdate(event.payload.orderId, 'preparing');
                break;
            case 'ORDER_DISPATCHED':
                await handleOrderStatusUpdate(event.payload.orderId, 'on_the_way');
                break;
            case 'ORDER_DELIVERED':
                await handleOrderStatusUpdate(event.payload.orderId, 'delivered');
                break;
            case 'ORDER_CANCELLED':
                await handleOrderStatusUpdate(event.payload.orderId, 'cancelled');
                break;
            case 'ORDER_CONCLUDED':
                await handleOrderStatusUpdate(event.payload.orderId, 'concluded');
                break;
            case 'ORDER_REJECTED':
                await handleOrderStatusUpdate(event.payload.orderId, 'rejected');
                break;
            default:

                break;
        }
    }


    exports.checkIfoodModuleEnabled = async (restaurantIdFromPayload) => {
        const restaurant = await models.Restaurant.findByPk(restaurantIdFromPayload);
        if (!restaurant || !restaurant.settings?.enabled_modules?.includes('ifood_integration')) {
            throw new ForbiddenError('iFood integration module not enabled for this restaurant.');
        }
        return restaurant;
    };

    exports.handleWebhook = async (event) => {

        await processWebhookEventInternal(event);
    };

    return {
        checkIfoodModuleEnabled,
        handleWebhook,
    };
};