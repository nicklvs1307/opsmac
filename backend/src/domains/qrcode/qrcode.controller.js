const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService"); // Import auditService

module.exports = (qrcodeService) => {
  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    createQRCode: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const qrcode = await qrcodeService.createQRCode(
        req.body,
        restaurantId,
        req.user.userId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "QRCODE_CREATED",
        `QRCode:${qrcode.id}`,
        { type: qrcode.type, target: qrcode.target_url },
      );
      res.status(201).json({ message: "QR Code criado com sucesso", qrcode });
    },

    listQRCodes: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { count, rows } = await qrcodeService.listQRCodes(
        restaurantId,
        req.query,
      );
      res.json({
        qrcodes: rows,
        pagination: {
          current_page: parseInt(req.query.page || 1),
          total_pages: Math.ceil(count / (req.query.limit || 20)),
          total_items: count,
          items_per_page: parseInt(req.query.limit || 20),
        },
      });
    },

    getQRCodeById: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const qrcode = await qrcodeService.getQRCodeById(
        req.params.id,
        restaurantId,
      );
      res.json({ qrcode });
    },

    updateQRCode: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const qrcode = await qrcodeService.updateQRCode(
        req.params.id,
        restaurantId,
        req.body,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "QRCODE_UPDATED",
        `QRCode:${qrcode.id}`,
        { updatedData: req.body },
      );
      res.json({ message: "QR Code atualizado com sucesso", qrcode });
    },

    deleteQRCode: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      await qrcodeService.deleteQRCode(req.params.id, restaurantId, req.user);
      await auditService.log(
        req.user,
        restaurantId,
        "QRCODE_DELETED",
        `QRCode:${req.params.id}`,
        {},
      );
      res.json({ message: "QR Code deletado com sucesso" });
    },

    generateQRCodeImage: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { size, format } = req.query;
      const qrCodeImage = await qrcodeService.generateQRCodeImage(
        req.params.id,
        restaurantId,
        parseInt(size),
        format,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "QRCODE_IMAGE_GENERATED",
        `QRCode:${req.params.id}`,
        { size, format },
      );
      if (format === "svg") {
        res.setHeader("Content-Type", "image/svg+xml");
      } else {
        res.setHeader("Content-Type", "image/png");
      }
      res.setHeader(
        "Content-Disposition",
        `inline; filename="qrcode.${format}"`,
      );
      res.send(qrCodeImage);
    },

    generatePrintableQRCode: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const printableQRCode = await qrcodeService.generatePrintableQRCode(
        req.params.id,
        restaurantId,
        req.query,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "QRCODE_PRINTABLE_GENERATED",
        `QRCode:${req.params.id}`,
        { query: req.query },
      );
      res.setHeader("Content-Type", "text/html");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="printable_qrcode.html"`,
      );
      res.send(printableQRCode);
    },

    recordScan: async (req, res, next) => {
      const result = await qrcodeService.recordScan(req.params.id, {
        user_agent: req.get("User-Agent"),
        ip_address: req.ip,
      });
      // No req.user for public routes, so pass null for user
      await auditService.log(
        null,
        result.restaurant?.id || null,
        "QRCODE_SCANNED",
        `QRCode:${req.params.id}`,
        { userAgent: req.get("User-Agent"), ipAddress: req.ip },
      );
      res.json({
        message: "Scan registrado com sucesso",
        feedback_url: result.feedback_url,
        short_url: result.short_url,
        restaurant_info: {
          name: result.restaurant?.name,
          table_number: result.table_number,
        },
      });
    },

    redirectToShortUrl: async (req, res, next) => {
      const redirectUrl = await qrcodeService.redirectToShortUrl(
        req.params.shortCode,
        req.get("User-Agent"),
        req.ip,
      );
      // No req.user for public routes, so pass null for user
      // restaurantId is not directly available here, so pass null
      await auditService.log(
        null,
        null,
        "QRCODE_SHORT_URL_REDIRECT",
        `ShortCode:${req.params.shortCode}`,
        { userAgent: req.get("User-Agent"), ipAddress: req.ip, redirectUrl },
      );
      res.redirect(redirectUrl);
    },

    getQRCodeAnalytics: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const analytics = await qrcodeService.getQRCodeAnalytics(
        req.params.id,
        restaurantId,
        req.query.period,
      );
      res.json({
        qrcode_analytics: analytics.qrcode_analytics,
        period_analytics: analytics.period_analytics,
      });
    },

    cloneQRCode: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const clonedQRCodes = await qrcodeService.cloneQRCode(
        req.params.id,
        restaurantId,
        req.body.table_numbers,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "QRCODE_CLONED",
        `OriginalQRCode:${req.params.id}`,
        {
          clonedCount: clonedQRCodes.length,
          tableNumbers: req.body.table_numbers,
        },
      );
      res.status(201).json({
        message: `${clonedQRCodes.length} QR Codes clonados com sucesso`,
        cloned_qrcodes: clonedQRCodes,
      });
    },

    getRestaurantQRCodeStats: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const stats = await qrcodeService.getRestaurantQRCodeStats(restaurantId);
      res.json({ stats });
    },
  };
};
