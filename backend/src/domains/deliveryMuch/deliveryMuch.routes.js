const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const deliveryMuchService = require('./deliveryMuch.service')(db);
    const deliveryMuchController = require('./deliveryMuch.controller')(deliveryMuchService);

    const router = express.Router();

    // Rotas do Delivery Much
    // O webhook é público e a verificação do módulo deve ser feita no controller.
    router.post('/webhook', asyncHandler(deliveryMuchController.handleWebhook));
    router.get('/orders', auth, requirePermission('deliveryMuch', 'read'), asyncHandler(deliveryMuchController.getOrders));

    return router;
};