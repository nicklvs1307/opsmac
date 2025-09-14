module.exports = (db) => {
  const models = db;
  const { Op } = require("sequelize");
  const { BadRequestError, NotFoundError } = require("utils/errors");

  const listGoals = async (restaurantId, query) => {
    const { page = 1, limit = 10, status, metric } = query;
    const offset = (page - 1) * limit;

    let whereClause = { restaurantId };

    if (status) {
      whereClause.status = status;
    }
    if (metric) {
      whereClause.metric = metric;
    }

    const { count, rows } = await models.Goal.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return {
      goals: rows,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / limit),
        current_page: parseInt(page),
      },
    };
  };

  const getGoalById = async (goalId, restaurantId) => {
    const goal = await models.Goal.findOne({
      where: { id: goalId, restaurantId },
    });
    if (!goal) {
      throw new NotFoundError("Meta não encontrada.");
    }
    return goal;
  };

  const createGoal = async (goalData, restaurantId) => {
    const newGoal = await models.Goal.create({
      ...goalData,
      restaurantId,
    });
    return newGoal;
  };

  const updateGoal = async (goalId, updateData, restaurantId) => {
    const goal = await getGoalById(goalId, restaurantId);
    await goal.update(updateData);
    return goal;
  };

  const deleteGoal = async (goalId, restaurantId) => {
    const goal = await getGoalById(goalId, restaurantId);
    await goal.destroy();
    return { message: "Meta excluída com sucesso." };
  };

  // Function to update goal progress (can be called by a cron job or trigger)
  const updateGoalProgress = async (goalId, restaurantId) => {
    const goal = await getGoalById(goalId, restaurantId);
    const dateFilter = {
      createdAt: { [Op.between]: [goal.startDate, goal.endDate] },
    };

    let currentValue = 0;
    switch (goal.metric) {
      case "totalCheckins":
        currentValue = await models.Checkin.count({
          where: { restaurantId, ...dateFilter },
        });
        break;
      case "newCustomers":
        currentValue = await models.Customer.count({
          where: { restaurantId, ...dateFilter },
        });
        break;
      case "avgNpsScore": {
        const npsResult = await models.Feedback.findOne({
          where: {
            restaurantId,
            npsScore: { [Op.not]: null },
            ...dateFilter,
          },
          attributes: [
            [
              db.sequelize.fn("AVG", db.sequelize.col("npsScore")),
              "avgNpsScore",
            ],
          ],
          raw: true,
        });
        currentValue = npsResult?.avgNpsScore || 0;
        break;
      }
      // A métrica 'totalLoyaltyPoints' foi removida porque sua lógica estava fundamentalmente incorreta.
      // Ela somava o total de pontos de um cliente, não os pontos ganhos no período da meta.
      // Para implementá-la corretamente, seria necessário um histórico de transações de pontos, que não existe atualmente.
      case "totalSpent":
        currentValue = await models.FinancialTransaction.sum("amount", {
          where: {
            restaurantId,
            type: "income", // Assuming we only count income towards goals
            ...dateFilter,
          },
        });
        break;
      // Add more metrics as needed
    }

    let status = "active";
    if (currentValue >= goal.targetValue) {
      status = "achieved";
    } else if (new Date() > new Date(goal.endDate)) {
      status = "failed";
    }

    await goal.update({ currentValue, status });
    return goal;
  };

  return {
    listGoals,
    getGoalById,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
  };
};
