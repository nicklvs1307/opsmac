module.exports = (cashRegisterService) => {
  const { validationResult } = require('express-validator');
  const BadRequestError = require('utils/errors/BadRequestError');
  const auditService = require('services/auditService');

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
                                res.status(201).json({ success: true, data: session, message: 'Sessão de caixa aberta com sucesso.' });
  };

  const getCurrentSession = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const session = await cashRegisterService.getCurrentSession(restaurantId, req.user.userId);
    res.json({ success: true, data: session });
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
    res.status(201).json({ success: true, data: movement, message: 'Reforço registrado com sucesso.' });
  };

  const getCashRegisterCategories = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const { type } = req.query;
    const categories = await cashRegisterService.getCashRegisterCategories(restaurantId, type);
    res.json({ success: true, data: categories });
  };

  const getMovements = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const { sessionId } = req.query;
    const movements = await cashRegisterService.getMovements(restaurantId, sessionId);
    res.json({ success: true, data: movements });
  };

  const closeSession = async (req, res, next) => {
    handleValidationErrors(req);
    const { sessionId, closingCash, closingObservations } = req.body;
    const restaurantId = req.context.restaurantId;
    const session = await cashRegisterService.closeSession(sessionId, restaurantId, req.user.userId, closingCash, closingObservations);
    await auditService.log(req.user, restaurantId, 'CASH_REGISTER_SESSION_CLOSED', `Session:${session.id}`, { closingCash, closingObservations });
    res.json({ success: true, data: session, message: 'Sessão de caixa fechada com sucesso.' });
  };

  const getCashOrders = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const { sessionId } = req.query;
    const orders = await cashRegisterService.getCashOrders(restaurantId, sessionId);
    res.json({ success: true, data: orders });
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