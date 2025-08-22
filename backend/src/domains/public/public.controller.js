const publicService = require('./public.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.testEndpoint = async (req, res, next) => {
  try {
    const result = publicService.testEndpoint();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.submitPublicFeedback = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurant_id = req.restaurant.id; // Obter restaurant_id do objeto req.restaurant
    const { customer_id, rating, comment, nps_score } = req.body;
    const newFeedback = await publicService.submitPublicFeedback(
      restaurant_id,
      customer_id,
      rating,
      comment,
      nps_score
    );
    res.status(201).json(newFeedback);
  } catch (error) {
    next(error);
  }
};

exports.registerPublicCheckin = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurant = req.restaurant; // From checkCheckinModuleEnabled middleware
    const { phone_number, cpf, customer_name, table_number } = req.body;
    const result = await publicService.registerPublicCheckin(
      restaurant,
      phone_number,
      cpf,
      customer_name,
      table_number
    );
    res.status(201).json({
      message: 'Check-in registrado com sucesso',
      checkin: result.checkin,
      customer_total_visits: result.customer_total_visits,
      reward_earned: result.reward_earned
    });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantInfoBySlug = async (req, res, next) => {
  try {
    const { restaurantSlug } = req.params;
    const restaurant = await publicService.getRestaurantInfoBySlug(restaurantSlug);
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

exports.getPublicSurveyByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const survey = await publicService.getPublicSurveyByIdentifier(identifier);
    res.json(survey);
  } catch (error) {
    next(error);
  }
};
