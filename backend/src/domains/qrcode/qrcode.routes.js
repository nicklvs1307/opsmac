const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const { logUserAction } = require('../../middleware/logUserActionMiddleware');
const checkPermission = require('../../middleware/permission');
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
router.post('/', auth, checkPermission('qrcodes:create'), createQRCodeValidation, logUserAction('create_qrcode'), qrcodeController.createQRCode);
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, checkPermission('qrcodes:view'), listQRCodesValidation, qrcodeController.listQRCodes);
router.get('/:id', auth, checkPermission('qrcodes:view'), qrcodeController.getQRCodeById);
router.put('/:id', auth, checkPermission('qrcodes:edit'), updateQRCodeValidation, logUserAction('update_qrcode'), qrcodeController.updateQRCode);
router.delete('/:id', auth, checkPermission('qrcodes:delete'), logUserAction('delete_qrcode'), qrcodeController.deleteQRCode);
router.get('/:id/image', auth, checkPermission('qrcodes:view'), generateImageValidation, qrcodeController.generateQRCodeImage);
router.get('/:id/printable', auth, checkPermission('qrcodes:view'), generatePrintableValidation, qrcodeController.generatePrintableQRCode);
router.post('/:id/scan', qrcodeController.recordScan);
router.get('/short/:shortCode', qrcodeController.redirectToShortUrl);
router.get('/:id/analytics', auth, checkPermission('qrcodes:view'), analyticsValidation, qrcodeController.getQRCodeAnalytics);
router.post('/:id/clone', auth, checkPermission('qrcodes:create'), cloneQRCodeValidation, logUserAction('clone_qrcode'), qrcodeController.cloneQRCode);
router.get('/restaurant/:restaurantId/stats', auth, checkRestaurantOwnership, checkPermission('qrcodes:view'), qrcodeController.getRestaurantQRCodeStats);

module.exports = router;
