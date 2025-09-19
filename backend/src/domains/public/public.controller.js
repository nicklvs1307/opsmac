import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js"; // Import auditService

import publicServiceFactory from "./public.service.js";

export default (db) => {
  const publicService = publicServiceFactory(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };


  const submitPublicFeedback = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurant_id = req.restaurant.id;
    const { customer_id, rating, comment, nps_score } = req.body;
    const newFeedback = await publicService.submitPublicFeedback(
      restaurant_id,
      customer_id,
      rating,
      comment,
      nps_score,
    );
    await auditService.log(
      null,
      restaurant_id,
      "PUBLIC_FEEDBACK_SUBMITTED",
      `Feedback:${newFeedback.id}`,
      { rating, nps_score },
    );
    res.status(201).json(newFeedback);
  };


  const getRestaurantInfoBySlug = async (req, res, next) => {
    const { restaurantSlug } = req.params;
    const restaurant =
      await publicService.getRestaurantInfoBySlug(restaurantSlug);
    res.json(restaurant);
  };

  const getPublicSurveyByIdentifier = async (req, res, next) => {
    const { identifier } = req.params;
    const survey = await publicService.getPublicSurveyByIdentifier(identifier);
    res.json(survey);
  };

  return {
    submitPublicFeedback,
    getRestaurantInfoBySlug,
    getPublicSurveyByIdentifier,
  };
};
