module.exports = (cashRegisterService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');
  const auditService = require('../../services/auditService'); // Import auditService

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const openSession = async (req, res, next) => {
    handleValidationErrors(req);
    const { openingCash, openingObservations } = req.body;
    const restaurantId = req.context.restaurantId;
    const session = await cashRegisterService.openSession(restaurantId, req.user.userId, openingCash, openingObservations);
    await auditService.log(req.user, restaurantId, 'CASH_REGISTER_SESSION_OPENED', `Session:${session.id}`, { openingCash, openingObservations });
    res.status(201).json(session);
  };

  const getCurrentSession = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const session = await cashRegisterService.getCurrentSession(restaurantId, req.user.userId);
    res.json(session);
  };

  const recordWithdrawal = async (req, res, next) => {
    handleValidationErrors(req);
    const { sessionId, amount, categoryId, observations } = req.body;
    const movement = await cashRegisterService.recordMovement(sessionId, 'withdrawal', amount, categoryId, observations, req.user.userId);
    await auditService.log(req.user, req.context.restaurantId, 'CASH_REGISTER_WITHDRAWAL_RECORDED', `Movement:${movement.id}`, { sessionId, amount, categoryId, observations });
    res.status(201).json(movement);
  };

  const recordReinforcement = async (req, res, next) => {
    handleValidationErrors(req);
    const { sessionId, amount, observations } = req.body;
    const movement = await cashRegisterService.recordMovement(sessionId, 'reinforcement', amount, null, observations, req.user.userId);
    await auditService.log(req.user, req.context.restaurantId, 'CASH_REGISTER_REINFORCEMENT_RECORDED', `Movement:${movement.id}`, { sessionId, amount, observations });
    res.status(201).json(movement);
  };

  const getCashRegisterCategories = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const { type } = req.query;
    const categories = await cashRegisterService.getCashRegisterCategories(restaurantId, type);
    res.json(categories);
  };

  const getMovements = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const { sessionId } = req.query;
    const movements = await cashRegisterService.getMovements(restaurantId, sessionId);
    res.json(movements);
  };

  const closeSession = async (req, res, next) => {
    handleValidationErrors(req);
    const { sessionId, closingCash, closingObservations } = req.body;
    const restaurantId = req.context.restaurantId;
    const session = await cashRegisterService.closeSession(sessionId, restaurantId, req.user.userId, closingCash, closingObservations);
    await auditService.log(req.user, restaurantId, 'CASH_REGISTER_SESSION_CLOSED', `Session:${session.id}`, { closingCash, closingObservations });
    res.json(session);
  };

  const getCashOrders = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const { sessionId } = req.query;
    const orders = await cashRegisterService.getCashOrders(restaurantId, sessionId);
    res.json(orders);
  };

  return {
    openSession,
    getCurrentSession,
    recordWithdrawal,
    recordReinforcement,
    getCashRegisterCategories,
    getMovements,
    closeSession,
    getCashOrders,
  };
};