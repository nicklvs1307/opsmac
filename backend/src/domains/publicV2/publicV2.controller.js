const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService"); // Import auditService

module.exports = (db) => {
  const publicV2Service = require("./publicV2.service")(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    testEndpoint: (req, res, next) => {
      const result = publicV2Service.testEndpoint();
      res.json(result);
    },

    submitFeedback: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurant_id = req.restaurant.id;
      const { customer_id, rating, comment, nps_score } = req.body;
      const newFeedback = await publicV2Service.submitFeedback(
        restaurant_id,
        customer_id,
        rating,
        comment,
        nps_score,
      );
      // No req.user for public routes, so pass null for user
      await auditService.log(
        null,
        restaurant_id,
        "PUBLIC_V2_FEEDBACK_SUBMITTED",
        `Feedback:${newFeedback.id}`,
        { rating, nps_score },
      );
      res.status(201).json(newFeedback);
    },

    registerCheckin: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurant_id = req.restaurant.id;
      const { customer_id } = req.body;
      const checkin = await publicV2Service.registerCheckin(
        restaurant_id,
        customer_id,
      );
      // No req.user for public routes, so pass null for user
      await auditService.log(
        null,
        restaurant_id,
        "PUBLIC_V2_CHECKIN_REGISTERED",
        `Checkin:${checkin.id}`,
        { customer_id },
      );
      res.status(201).json({
        message: "Check-in registrado com sucesso",
        checkin,
      });
    },
  };
};
