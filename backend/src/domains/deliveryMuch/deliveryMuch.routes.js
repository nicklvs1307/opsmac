const express = require('express');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const deliveryMuchController = require('domains/deliveryMuch/deliveryMuch.controller')(db);

    const router = express.Router();

    // Rotas do Delivery Much
    // O webhook é público e a verificação do módulo deve ser feita no controller.
    router.post('/webhook', deliveryMuchController.handleWebhook);
    router.get('/orders', auth, requirePermission('deliveryMuch', 'read'), (req, res, next) => deliveryMuchController.getOrders(req, res, next));

    return router;
};