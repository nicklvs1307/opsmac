const express = require('express');
const { logUserAction } = require('../../middleware/logUserActionMiddleware');
const requirePermission = require('../../middleware/requirePermission');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const qrcodeController = require('./qrcode.controller')(db);
    const {
        createQRCodeValidation,
        updateQRCodeValidation,
        generateImageValidation,
        generatePrintableValidation,
        analyticsValidation,
        cloneQRCodeValidation,
        listQRCodesValidation
    } = require('./qrcode.validation');

    const router = express.Router();

    // Rotas de QR Code
    router.post('/', auth, requirePermission('qrcodes', 'create'), createQRCodeValidation, logUserAction('create_qrcode'), qrcodeController.createQRCode);
    router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('qrcodes', 'read'), listQRCodesValidation, qrcodeController.listQRCodes);
    router.get('/:id', auth, requirePermission('qrcodes', 'read'), qrcodeController.getQRCodeById);
    router.put('/:id', auth, requirePermission('qrcodes', 'update'), updateQRCodeValidation, logUserAction('update_qrcode'), qrcodeController.updateQRCode);
    router.delete('/:id', auth, requirePermission('qrcodes', 'delete'), logUserAction('delete_qrcode'), qrcodeController.deleteQRCode);
    router.get('/:id/image', auth, requirePermission('qrcodes', 'read'), generateImageValidation, qrcodeController.generateQRCodeImage);
    router.get('/:id/printable', auth, requirePermission('qrcodes', 'read'), generatePrintableValidation, qrcodeController.generatePrintableQRCode);
    router.post('/short/:shortCode', qrcodeController.redirectToShortUrl);
    router.post('/:id/scan', qrcodeController.recordScan);
    router.get('/:id/analytics', auth, requirePermission('qrcodes', 'read'), analyticsValidation, qrcodeController.getQRCodeAnalytics);
    router.post('/:id/clone', auth, requirePermission('qrcodes', 'create'), cloneQRCodeValidation, logUserAction('clone_qrcode'), qrcodeController.cloneQRCode);
    router.get('/restaurant/:restaurantId/stats', auth, checkRestaurantOwnership, requirePermission('qrcodes', 'read'), qrcodeController.getRestaurantQRCodeStats);

    return router;
};