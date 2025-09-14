const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService");

module.exports = (db) => {
  const goalsService = require("./goals.service")(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    listGoals: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const data = await goalsService.listGoals(restaurantId, req.query);
      res.json(data);
    },

    getGoalById: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const goal = await goalsService.getGoalById(req.params.id, restaurantId);
      res.json(goal);
    },

    createGoal: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newGoal = await goalsService.createGoal(req.body, restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "GOAL_CREATED",
        `Goal:${newGoal.id}`,
        { name: newGoal.name },
      );
      res.status(201).json(newGoal);
    },

    updateGoal: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const updatedGoal = await goalsService.updateGoal(
        req.params.id,
        req.body,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "GOAL_UPDATED",
        `Goal:${updatedGoal.id}`,
        { changes: req.body },
      );
      res.json(updatedGoal);
    },

    deleteGoal: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      await goalsService.deleteGoal(req.params.id, restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "GOAL_DELETED",
        `Goal:${req.params.id}`,
        {},
      );
      res.status(200).json({ message: "Meta excluída com sucesso." });
    },

    updateGoalProgress: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const updatedGoal = await goalsService.updateGoalProgress(
        req.params.id,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "GOAL_PROGRESS_UPDATED",
        `Goal:${updatedGoal.id}`,
        { progress: updatedGoal.currentValue },
      );
      res.json(updatedGoal);
    },
  };
};
