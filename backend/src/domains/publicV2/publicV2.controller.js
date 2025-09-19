import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";
import publicV2ServiceFactory from "./publicV2.service.js";

export default (db) => {
  const publicV2Service = publicV2ServiceFactory(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {

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
