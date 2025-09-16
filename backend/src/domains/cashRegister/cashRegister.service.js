export default (db) => {
  const { models } = db;
  import { BadRequestError, NotFoundError } from "../../utils/errors.js";
  import { generateEscPosCommands } from "../../utils/thermalPrinterService.js";

  const openSession = async (
    restaurantId,
    userId,
    openingCash,
    openingObservations,
  ) => {
    const existingOpenSession = await models.CashRegisterSession.findOne({
      where: {
        restaurantId: restaurantId,
        userId: userId,
        status: "open",
      },
    });

    if (existingOpenSession) {
      throw new BadRequestError(
        "There is already an open cash register session for this user and restaurant.",
      );
    }

    const session = await models.CashRegisterSession.create({
      restaurantId: restaurantId,
      userId: userId,
      openingCash,
      openingObservations,
      status: "open",
    });

    return session;
  };

  const getCurrentSession = async (restaurantId, userId) => {
    const session = await models.CashRegisterSession.findOne({
      where: {
        restaurantId: restaurantId,
        userId: userId,
        status: "open",
      },
    });

    if (!session) {
      throw new NotFoundError(
        "No open cash register session found for this user and restaurant.",
      );
    }

    return session;
  };

  const recordMovement = async (
    sessionId,
    type,
    amount,
    categoryId,
    observations,
    userId,
  ) => {
    const session = await models.CashRegisterSession.findByPk(sessionId);
    if (!session || session.status !== "open") {
      throw new NotFoundError("Open cash register session not found.");
    }

    const movement = await models.CashRegisterMovement.create({
      sessionId,
      type,
      amount,
      categoryId,
      observations,
      userId: userId,
    });

    return movement;
  };

  const getCashRegisterCategories = async (restaurantId, type) => {
    let whereClause = {
      [models.Sequelize.Op.or]: [
        { restaurantId: restaurantId },
        { restaurantId: null }, // Global categories
      ],
    };

    if (type) {
      whereClause.type = type;
    }

    const categories = await models.CashRegisterCategory.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });

    return categories;
  };

  const getMovements = async (restaurantId, sessionId) => {
    const session = await models.CashRegisterSession.findOne({
      where: { id: sessionId, restaurantId: restaurantId },
    });

    if (!session) {
      throw new NotFoundError(
        "Cash register session not found for this restaurant.",
      );
    }

    const movements = await models.CashRegisterMovement.findAll({
      where: { sessionId },
      include: [
        { model: models.CashRegisterCategory, as: "category" },
        { model: models.User, as: "user", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    return movements;
  };

  const closeSession = async (
    sessionId,
    restaurantId,
    userId,
    closingCash,
    closingObservations,
  ) => {
    const session = await models.CashRegisterSession.findOne({
      where: {
        id: sessionId,
        restaurantId: restaurantId,
        userId: userId,
        status: "open",
      },
    });

    if (!session) {
      throw new NotFoundError(
        "Open cash register session not found for this user and restaurant.",
      );
    }

    await session.update({
      closingCash,
      closingObservations,
      closingTime: new Date(),
      status: "closed",
    });

    return session;
  };

  const getCashOrders = async (restaurantId, sessionId) => {
    const session = await models.CashRegisterSession.findOne({
      where: { id: sessionId, restaurantId: restaurantId },
    });

    if (!session) {
      throw new NotFoundError(
        "Cash register session not found for this restaurant.",
      );
    }

    const orders = await models.Order.findAll({
      where: {
        restaurantId: restaurantId,
        paymentMethod: "cash",
        orderDate: {
          [models.Sequelize.Op.gte]: session.openingTime,
          [models.Sequelize.Op.lte]: session.closingTime || new Date(),
        },
      },
      attributes: ["id", "totalAmount", "orderDate"],
      order: [["orderDate", "ASC"]],
    });

    return orders;
  };

  return {
    openSession,
    getCurrentSession,
    recordMovement,
    getCashRegisterCategories,
    getMovements,
    closeSession,
    getCashOrders,
  };
};