        const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

module.exports = (qrcodeService) => {

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        createQRCode: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const qrcode = await qrcodeService.createQRCode(req.body, restaurantId, req.user.userId);
                res.status(201).json({ message: 'QR Code criado com sucesso', qrcode });
            } catch (error) {
                next(error);
            }
        };

        listQRCodes: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const { count, rows } = await qrcodeService.listQRCodes(restaurantId, req.query);
                res.json({
                    qrcodes: rows,
                    pagination: {
                        current_page: parseInt(req.query.page || 1),
                        total_pages: Math.ceil(count / (req.query.limit || 20)),
                        total_items: count,
                        items_per_page: parseInt(req.query.limit || 20)
                    }
                });
            } catch (error) {
                next(error);
            }
        };

        getQRCodeById: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                const qrcode = await qrcodeService.getQRCodeById(req.params.id, restaurantId);
                res.json({ qrcode });
            } catch (error) {
                next(error);
            }
        };

        updateQRCode: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const qrcode = await qrcodeService.updateQRCode(req.params.id, restaurantId, req.body);
                res.json({ message: 'QR Code atualizado com sucesso', qrcode });
            } catch (error) {
                next(error);
            }
        };

        deleteQRCode: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                await qrcodeService.deleteQRCode(req.params.id, restaurantId, req.user);
                res.json({ message: 'QR Code deletado com sucesso' });
            } catch (error) {
                next(error);
            }
        };

        generateQRCodeImage: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const { size, format } = req.query;
                const qrCodeImage = await qrcodeService.generateQRCodeImage(req.params.id, restaurantId, parseInt(size), format);

                if (format === 'svg') {
                    res.setHeader('Content-Type', 'image/svg+xml');
                } else {
                    res.setHeader('Content-Type', 'image/png');
                }
                res.setHeader('Content-Disposition', `inline; filename="qrcode.${format}"`);
                res.send(qrCodeImage);
            } catch (error) {
                next(error);
            }
        };

        generatePrintableQRCode: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const printableQRCode = await qrcodeService.generatePrintableQRCode(req.params.id, restaurantId, req.query);

                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Disposition', `inline; filename="printable_qrcode.html"`);
                res.send(printableQRCode);
            } catch (error) {
                next(error);
            }
        };

        recordScan: async (req, res, next) => {
            try {
                const result = await qrcodeService.recordScan(req.params.id, { user_agent: req.get('User-Agent'), ip_address: req.ip });
                res.json({
                    message: 'Scan registrado com sucesso',
                    feedback_url: result.feedback_url,
                    short_url: result.short_url,
                    restaurant_info: {
                        name: result.restaurant?.name,
                        table_number: result.table_number
                    }
                });
            } catch (error) {
                next(error);
            }
        };

        redirectToShortUrl: async (req, res, next) => {
            try {
                const redirectUrl = await qrcodeService.redirectToShortUrl(req.params.shortCode, req.get('User-Agent'), req.ip);
                res.redirect(redirectUrl);
            } catch (error) {
                next(error);
            }
        };

        getQRCodeAnalytics: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const analytics = await qrcodeService.getQRCodeAnalytics(req.params.id, restaurantId, req.query.period);
                res.json({ qrcode_analytics: analytics.qrcode_analytics, period_analytics: analytics.period_analytics });
            } catch (error) {
                next(error);
            }
        };

        cloneQRCode: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const clonedQRCodes = await qrcodeService.cloneQRCode(req.params.id, restaurantId, req.body.table_numbers);
                res.status(201).json({
                    message: `${clonedQRCodes.length} QR Codes clonados com sucesso`,
                    cloned_qrcodes: clonedQRCodes
                });
            } catch (error) {
                next(error);
            }
        };

        getRestaurantQRCodeStats: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                const stats = await qrcodeService.getRestaurantQRCodeStats(restaurantId);
                res.json({ stats });
            } catch (error) {
                next(error);
            }
        };

    
    