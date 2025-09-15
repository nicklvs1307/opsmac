const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService"); // Import auditService

module.exports = (db) => {
  const publicService = require("./public.service")(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const testEndpoint = async (req, res, next) => {
    const result = publicService.testEndpoint();
    res.json(result);
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

  const createPublicOrder = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurant = req.restaurant;
    const orderData = req.body;
    const newOrder = await publicService.createPublicOrder(
      restaurant,
      orderData,
    );
    await auditService.log(
      null,
      restaurant.id,
      "PUBLIC_ORDER_CREATED",
      `Order:${newOrder.id}`,
      { total: newOrder.total, items: newOrder.items.length },
    );
    res.status(201).json(newOrder);
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
    testEndpoint,
    submitPublicFeedback,
    createPublicOrder,
    getRestaurantInfoBySlug,
    getPublicSurveyByIdentifier,
  };
};
