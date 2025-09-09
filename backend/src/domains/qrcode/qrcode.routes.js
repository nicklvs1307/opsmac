const express = require('express');
const { logUserAction } = require('middleware/logUserActionMiddleware');
const requirePermission = require('middleware/requirePermission');
const qrcodeServiceFactory = require('domains/qrcode/qrcode.service');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('middleware/authMiddleware')(db);
    const qrcodeService = qrcodeServiceFactory(db);
    const qrcodeController = require('domains/qrcode/qrcode.controller')(qrcodeService);
    const { createQRCodeValidation, updateQRCodeValidation, generateImageValidation, generatePrintableValidation, analyticsValidation, cloneQRCodeValidation, listQRCodesValidation } = require('domains/qrcode/qrcode.validation');

    const router = express.Router();

    // Rotas de QR Code
    console.log('qrcodeController in qrcode.routes.js:', qrcodeController);
    console.log('qrcodeController.listQRCodes in qrcode.routes.js:', qrcodeController.listQRCodes);
    router.post('/', auth, requirePermission('qrcodes', 'create'), createQRCodeValidation, logUserAction('create_qrcode'), qrcodeController.createQRCode);
    router.get('/restaurant/:restaurantId', async (req, res) => {
        res.send('Test route works!');
    });
    router.get('/:id', auth, requirePermission('qrcodes', 'read'), qrcodeController.getQRCodeById);
    router.put('/:id', auth, requirePermission('qrcodes', 'update'), updateQRCodeValidation, logUserAction('update_qrcode'), qrcodeController.updateQRCode);
    router.delete('/:id', auth, requirePermission('qrcodes', 'delete'), logUserAction('delete_qrcode'), qrcodeController.deleteQRCode);
    router.get('/:id/image', auth, requirePermission('qrcodes', 'read'), generateImageValidation, qrcodeController.generateQRCodeImage);
    router.get('/:id/printable', auth, requirePermission('qrcodes', 'read'), generatePrintableValidation, qrcodeController.generatePrintableQRCode);
    router.post('/short/:shortCode', qrcodeController.redirectToShortUrl);
    router.post('/:id/scan', qrcodeController.recordScan);
    router.get('/:id/analytics', auth, requirePermission('qrcodes', 'read'), analyticsValidation, qrcodeController.getQRCodeAnalytics);
    router.post('/:id/clone', auth, requirePermission('qrcodes', 'create'), cloneQRCodeValidation, logUserAction('clone_qrcode'), qrcodeController.cloneQRCode);
    console.log('DEBUG: qrcodeService:', qrcodeService);
    console.log('DEBUG: qrcodeController:', qrcodeController);
    console.log('DEBUG: qrcodeController.getRestaurantQRCodeStats:', qrcodeController.getRestaurantQRCodeStats);
    router.get('/restaurant/:restaurantId/stats', (req, res, next) => qrcodeController.getRestaurantQRCodeStats(req, res, next));

    return router;
};