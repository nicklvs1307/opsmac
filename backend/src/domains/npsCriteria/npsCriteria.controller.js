const npsCriteriaService = require('./npsCriteria.service');
const { validationResult } = require('express-validator');
const { BadRequestError, ForbiddenError } = require('../../utils/errors');
const { getRestaurantIdFromUser } = require('../../services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.listNpsCriteria = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    if (!restaurantId) {
      throw new ForbiddenError('Usuário não está associado a um restaurante.');
    }
    const criteria = await npsCriteriaService.listNpsCriteria(restaurantId);
    res.json(criteria);
  } catch (error) {
    next(error);
  }
};

exports.createNpsCriterion = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { name } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const newCriterion = await npsCriteriaService.createNpsCriterion(name, restaurantId);
    res.status(201).json(newCriterion);
  } catch (error) {
    next(error);
  }
};

exports.updateNpsCriterion = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { name } = req.body;
    const { id } = req.params;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const updatedCriterion = await npsCriteriaService.updateNpsCriterion(id, name, restaurantId);
    res.json(updatedCriterion);
  } catch (error) {
    next(error);
  }
};

exports.deleteNpsCriterion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    await npsCriteriaService.deleteNpsCriterion(id, restaurantId);
    res.json({ message: 'Critério removido com sucesso.' });
  } catch (error) {
    next(error);
  }
};
