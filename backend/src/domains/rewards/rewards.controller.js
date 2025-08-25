const rewardsService = require('./rewards.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.listRewards = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const data = await rewardsService.listRewards(restaurantId, req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getRewardById = async (req, res, next) => {
  try {
    const reward = await rewardsService.getRewardById(req.params.id);
    res.json(reward);
  } catch (error) {
    next(error);
  }
};

exports.createReward = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const reward = await rewardsService.createReward(req.body, restaurantId, req.user.userId);
    res.status(201).json(reward);
  } catch (error) {
    next(error);
  }
};

exports.updateReward = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const reward = await rewardsService.updateReward(req.params.id, req.body);
    res.json(reward);
  } catch (error) {
    next(error);
  }
};

exports.deleteReward = async (req, res, next) => {
  try {
    await rewardsService.deleteReward(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.spinWheel = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { reward_id, customer_id } = req.body;
    const result = await rewardsService.spinWheel(reward_id, customer_id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getRewardsAnalytics = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const data = await rewardsService.getRewardsAnalytics(restaurantId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
