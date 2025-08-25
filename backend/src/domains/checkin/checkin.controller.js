const checkinService = require('./checkin.service');
const { validationResult } = require('express-validator');
const { BadRequestError, ForbiddenError } = require('utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.checkCheckinModuleEnabled = async (req, res, next) => {
  try {
    let restaurantId = null;
    let restaurantSlug = null;

    if (req.user && req.user.restaurants && req.user.restaurants[0]) {
      restaurantId = req.user.restaurants[0].id;
    } else if (req.params.restaurantSlug) {
      restaurantSlug = req.params.restaurantSlug;
    } else if (req.params.restaurantId) {
      restaurantId = req.params.restaurantId;
    }

    const restaurant = await checkinService.checkCheckinModuleEnabled(restaurantId, restaurantSlug);
    req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição para uso posterior
    next();
  } catch (error) {
    next(error);
  }
};

exports.recordCheckin = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { customer_id } = req.body;
    const checkin = await checkinService.recordCheckin(customer_id, restaurantId);
    res.status(201).json({ message: 'Check-in registrado com sucesso', checkin });
  } catch (error) {
    next(error);
  }
};

exports.recordPublicCheckin = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurant = req.restaurant; // From checkCheckinModuleEnabled middleware
    const { phone_number, cpf, customer_name, table_number, coupon_id } = req.body;

    const result = await checkinService.recordPublicCheckin(
      restaurant,
      phone_number,
      cpf,
      customer_name,
      table_number,
      coupon_id
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

exports.checkoutCheckin = async (req, res, next) => {
  try {
    const { checkinId } = req.params;
    const userId = req.user.userId;
    const checkin = await checkinService.checkoutCheckin(checkinId, userId);
    res.json({ message: 'Check-out registrado com sucesso', checkin });
  } catch (error) {
    next(error);
  }
};

exports.getCheckinAnalytics = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = req.restaurant.id; // From checkCheckinModuleEnabled middleware
    const { period } = req.query;
    const analytics = await checkinService.getCheckinAnalytics(restaurantId, period);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

exports.getActiveCheckins = async (req, res, next) => {
  try {
    const restaurantId = req.restaurant.id; // From checkCheckinModuleEnabled middleware
    const activeCheckins = await checkinService.getActiveCheckins(restaurantId);
    res.json({ activeCheckins });
  } catch (error) {
    next(error);
  }
};
