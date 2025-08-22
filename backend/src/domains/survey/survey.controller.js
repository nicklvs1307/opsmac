const surveyService = require('./survey.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.listSurveys = async (req, res, next) => {
  try {
    const { search } = req.query;
    const restaurant_id = await getRestaurantIdFromUser(req.user.userId);
    const surveys = await surveyService.listSurveys(restaurant_id, search);
    res.json(surveys);
  } catch (error) {
    next(error);
  }
};

exports.createSurvey = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { type, title, slug, description, questions, status } = req.body;
    const { userId: user_id } = req.user;
    const restaurant_id = await getRestaurantIdFromUser(req.user.userId);
    const newSurvey = await surveyService.createSurvey(type, title, slug, description, questions, status, user_id, restaurant_id);
    res.status(201).json(newSurvey);
  } catch (error) {
    next(error);
  }
};

exports.updateSurvey = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { id } = req.params;
    const { title, slug, description, questions, status } = req.body;
    const restaurant_id = await getRestaurantIdFromUser(req.user.userId);
    const updatedSurvey = await surveyService.updateSurvey(id, title, slug, description, questions, status, restaurant_id);
    res.json(updatedSurvey);
  } catch (error) {
    next(error);
  }
};

exports.updateSurveyStatus = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { id } = req.params;
    const { status } = req.body;
    const restaurant_id = await getRestaurantIdFromUser(req.user.userId);
    const updatedSurvey = await surveyService.updateSurveyStatus(id, status, restaurant_id);
    res.json(updatedSurvey);
  } catch (error) {
    next(error);
  }
};

exports.deleteSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant_id = await getRestaurantIdFromUser(req.user.userId);
    await surveyService.deleteSurvey(id, restaurant_id);
    res.json({ message: 'Pesquisa removida com sucesso' });
  } catch (error) {
    next(error);
  }
};

exports.getSurveyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant_id = await getRestaurantIdFromUser(req.user.userId);
    const survey = await surveyService.getSurveyById(id, restaurant_id);
    res.json(survey);
  } catch (error) {
    next(error);
  }
};

exports.getSurveyAnalytics = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const analytics = await surveyService.getSurveyAnalytics(restaurantId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};
