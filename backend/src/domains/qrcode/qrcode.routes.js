const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../src/middleware/authMiddleware');
const { logUserAction } = require('../../src/middleware/logUserActionMiddleware');
const qrcodeController = require('./qrcode.controller');
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
router.post('/', auth, createQRCodeValidation, logUserAction('create_qrcode'), qrcodeController.createQRCode);
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, listQRCodesValidation, qrcodeController.listQRCodes);
router.get('/:id', auth, qrcodeController.getQRCodeById);
router.put('/:id', auth, updateQRCodeValidation, logUserAction('update_qrcode'), qrcodeController.updateQRCode);
router.delete('/:id', auth, logUserAction('delete_qrcode'), qrcodeController.deleteQRCode);
router.get('/:id/image', auth, generateImageValidation, qrcodeController.generateQRCodeImage);
router.get('/:id/printable', auth, generatePrintableValidation, qrcodeController.generatePrintableQRCode);
router.post('/:id/scan', qrcodeController.recordScan);
router.get('/short/:shortCode', qrcodeController.redirectToShortUrl);
router.get('/:id/analytics', auth, analyticsValidation, qrcodeController.getQRCodeAnalytics);
router.post('/:id/clone', auth, cloneQRCodeValidation, logUserAction('clone_qrcode'), qrcodeController.cloneQRCode);
router.get('/restaurant/:restaurantId/stats', auth, checkRestaurantOwnership, qrcodeController.getRestaurantQRCodeStats);

module.exports = router;
