const publicSurveyService = require('./publicSurvey.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.getNextSurvey = async (req, res, next) => {
  try {
    const { restaurantSlug, customerId } = req.params;
    const result = await publicSurveyService.getNextSurvey(restaurantSlug, customerId);
    res.json({ survey: result.survey, restaurant: result.restaurant });
  } catch (error) {
    next(error);
  }
};

exports.getPublicSurveyBySlugs = async (req, res, next) => {
  try {
    const { restaurantSlug, surveySlug } = req.params;
    const result = await publicSurveyService.getPublicSurveyBySlugs(restaurantSlug, surveySlug);
    res.json({ survey: result.survey, restaurant: result.restaurant });
  } catch (error) {
    next(error);
  }
};

exports.submitSurveyResponses = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { answers, customer_id } = req.body;
    const surveySlug = req.params.slug;
    const result = await publicSurveyService.submitSurveyResponses(surveySlug, answers, customer_id);
    res.status(201).json({
      message: 'Respostas enviadas com sucesso!',
      responseId: result.responseId,
      reward: result.reward
    });
  } catch (error) {
    next(error);
  }
};

exports.linkCustomerToResponse = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { responseId } = req.params;
    const { customer_id } = req.body;
    const result = await publicSurveyService.linkCustomerToResponse(responseId, customer_id);
    res.json({
      message: 'Pesquisa vinculada com sucesso!',
      reward: result.reward
    });
  } catch (error) {
    next(error);
  }
};
