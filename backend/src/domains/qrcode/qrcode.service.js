import QRCodeLib from "qrcode";
import { Op, fn, col } from "sequelize";
import { NotFoundError, BadRequestError } from "../../utils/errors";

export default (db) => {
  const { models } = db;

  const generateQRCodeImage = async (qrCode, size, format) => {
    const qrCodeUrl = qrCode.feedback_url;
    const options = {
      errorCorrectionLevel: "H",
      type: format === "svg" ? "svg" : "image/png",
      quality: 0.92,
      margin: 1,
      width: size,
      color: {
        dark: "#000000FF",
        light: "#FFFFFFFF",
      },
    };

    if (format === "svg") {
      return await QRCodeLib.toString(qrCodeUrl, options);
    } else {
      return await QRCodeLib.toBuffer(qrCodeUrl, options);
    }
  };

  const generatePrintableQRCode = async (qrCode, options) => {
    const { include_info } = options;
    const qrCodeImage = await generateQRCodeImage(qrCode, 200, "png");

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>QR Code - Mesa ${qrCode.table_number}</title>
        <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f0f0f0; }
            .container { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center; }
            img { max-width: 100%; height: auto; }
            .info { margin-top: 15px; }
            .table-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
            .restaurant-name { font-size: 1.2em; color: #555; }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="data:image/png;base64,${qrCodeImage.toString("base64")}" alt="QR Code">
  `;

    if (include_info) {
      html += `
            <div class="info">
                <div class="table-number">Mesa ${qrCode.table_number}</div>
                <div class="restaurant-name">${qrCode.restaurant?.name || ""}</div>
            </div>
    `;
    }

    html += `
        </div>
    </body>
    </html>
  `;
    return html;
  };

  const recordScan = async (qrCode, scanData) => {
    await qrCode.increment("total_scans");
    await qrCode.update({ last_scan: new Date() });
    return qrCode;
  };

  const getQRCodeAnalytics = async (qrCode, period) => {
    const days = { "7d": 7, "30d": 30, "90d": 90 };
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days[period]);

    const feedbacks = await models.Feedback.findAll({
      where: {
        restaurant_id: qrCode.restaurant_id,
        table_number: qrCode.table_number,
        source: "qrcode",
        created_at: {
          [Op.gte]: startDate,
        },
      },
      attributes: ["rating", "created_at", "feedback_type"],
      order: [["created_at", "ASC"]],
    });

    const totalFeedbacks = feedbacks.length;
    const averageRating =
      totalFeedbacks > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
        : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: feedbacks.filter((f) => f.rating === rating).length,
    }));

    const conversionRate =
      qrCode.total_scans > 0
        ? ((qrCode.total_feedbacks / qrCode.total_scans) * 100).toFixed(2)
        : 0;

    return {
      qrcode_analytics: {
        total_scans: qrCode.total_scans,
        total_feedbacks: qrCode.total_feedbacks,
        average_rating: qrCode.average_rating,
        conversion_rate: parseFloat(conversionRate),
        last_scan: qrCode.last_scan,
        last_feedback: qrCode.last_feedback,
      },
      period_analytics: {
        period,
        total_feedbacks: totalFeedbacks,
        average_rating: parseFloat(averageRating.toFixed(1)),
        rating_distribution: ratingDistribution,
        feedbacks_timeline: feedbacks.map((f) => ({
          date: f.created_at.toISOString().split("T")[0],
          rating: f.rating,
          type: f.feedback_type,
        })),
      },
    };
  };

  const cloneQRCode = async (originalQRCode, tableNumbers) => {
    const clonedQRCodes = [];
    for (const tableNumber of tableNumbers) {
      const clonedQRCode = await models.QRCode.create({
        table_number: tableNumber,
        table_name: originalQRCode.table_name
          ? `${originalQRCode.table_name} (Cópia)`
          : null,
        location_description: originalQRCode.location_description,
        capacity: originalQRCode.capacity,
        area: originalQRCode.area,
        settings: originalQRCode.settings,
        print_settings: originalQRCode.print_settings,
        restaurant_id: originalQRCode.restaurant_id,
        created_by: originalQRCode.created_by,
      });
      clonedQRCodes.push(clonedQRCode);
    }
    return clonedQRCodes;
  };

  const getRestaurantQRCodeStats = async (restaurantId) => {
    return await models.QRCode.getTableStats(restaurantId);
  };

  const generateShortUrl = async (qrCode) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    do {
      result = "";
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (await models.QRCode.findOne({ where: { short_url: result } }));

    return result;
  };

  const recordFeedback = async (qrCode) => {
    const now = new Date();

    await qrCode.increment("total_feedbacks");
    await qrCode.update({ last_feedback: now });

    const analytics = { ...qrCode.analytics };
    if (qrCode.total_scans > 0) {
      analytics.conversion_rate =
        (qrCode.total_feedbacks / qrCode.total_scans) * 100;
    }

    await qrCode.update({ analytics });
  };

  const updateQRCodeStats = async (qrCode) => {
    const feedbackStats = await models.Feedback.findOne({
      where: {
        restaurant_id: qrCode.restaurant_id,
        table_number: qrCode.table_number,
      },
      attributes: [
        [fn("COUNT", col("id")), "total"],
        [fn("AVG", col("rating")), "average"],
      ],
      raw: true,
    });

    if (feedbackStats && feedbackStats.total > 0) {
      await qrCode.update({
        total_feedbacks: parseInt(feedbackStats.total),
        average_rating: parseFloat(feedbackStats.average || 0).toFixed(2),
      });
    }

    return qrCode;
  };

  const generateQRCodeDataAndUrl = async (qrCode) => {
    const baseUrl =
      process.env.FRONTEND_URL || "https://feedelizapro.towersfy.com";

    if (qrCode.qr_type === "checkin") {
      const restaurant = await models.Restaurant.findByPk(qrCode.restaurant_id);
      if (!restaurant)
        throw new NotFoundError(
          "Restaurante não encontrado para gerar URL de check-in.",
        );
      qrCode.feedback_url = `${baseUrl}/checkin/public/${restaurant.slug}`;
      qrCode.qr_code_data = JSON.stringify({
        type: "checkin",
        restaurant_slug: restaurant.slug,
        url: qrCode.feedback_url,
        created_at: new Date().toISOString(),
      });
    } else if (qrCode.qr_type === "menu") {
      const table = await models.Table.findOne({
        where: {
          restaurant_id: qrCode.restaurant_id,
          table_number: qrCode.table_number,
        },
      });
      let tableId;
      if (!table) {
        const newTable = await models.Table.create({
          restaurant_id: qrCode.restaurant_id,
          table_number: qrCode.table_number,
        });
        tableId = newTable.id;
      } else {
        tableId = table.id;
      }
      qrCode.feedback_url = `${baseUrl}/menu/dine-in/${tableId}`;
      qrCode.qr_code_data = JSON.stringify({
        type: "menu",
        table_id: tableId,
        url: qrCode.feedback_url,
        created_at: new Date().toISOString(),
      });
    } else {
      qrCode.feedback_url = `${baseUrl}/feedback/new?qrCodeId=${qrCode.id}`;
      qrCode.qr_code_data = JSON.stringify({
        type: "feedback",
        qr_code_id: qrCode.id,
        url: qrCode.feedback_url,
        created_at: new Date().toISOString(),
      });
    }
  };

  const handleQRCodeBeforeCreate = async (qrCode) => {
    await generateQRCodeDataAndUrl(qrCode);
    if (!qrCode.short_url) {
      qrCode.short_url = await generateShortUrl(qrCode);
    }
  };

  const handleQRCodeAfterCreate = async (qrCode) => {
    await generateQRCodeImage(qrCode, qrCode.settings?.size || 200, "png");
  };

  return {
    generateQRCodeImage,
    generatePrintableQRCode,
    recordScan,
    getQRCodeAnalytics,
    cloneQRCode,
    getRestaurantQRCodeStats,
    generateShortUrl,
    recordFeedback,
    updateQRCodeStats,
    generateQRCodeDataAndUrl,
    handleQRCodeBeforeCreate,
    handleQRCodeAfterCreate,
  };
};