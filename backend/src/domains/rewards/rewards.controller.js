import { validationResult } from "express-validator";
import BadRequestError from "../../utils/errors/BadRequestError.js";
import auditService from "../../services/auditService.js";
import rewardsServiceFactory from "./rewards.service.js";

export default (db) => {
  const rewardsService = rewardsServiceFactory(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    listRewards: async (req, res, next) => {
      try {
        const restaurantId = req.context.restaurantId;
        const data = await rewardsService.listRewards(restaurantId, req.query);
        res.json(data);
      } catch (error) {
        next(error);
      }
    },

    getRewardById: async (req, res, next) => {
      try {
        const restaurantId = req.context.restaurantId;
        const reward = await rewardsService.getRewardById(
          req.params.id,
          restaurantId,
        );
        res.json(reward);
      } catch (error) {
        next(error);
      }
    },

    createReward: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const userId = req.user.id;
        const reward = await rewardsService.createReward(
          req.body,
          restaurantId,
          userId,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "REWARD_CREATED",
          `Reward:${reward.id}`,
          { title: reward.title, type: reward.rewardType },
        );
        res.status(201).json(reward);
      } catch (error) {
        next(error);
      }
    },

    updateReward: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const reward = await rewardsService.updateReward(
          req.params.id,
          req.body,
          restaurantId,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "REWARD_UPDATED",
          `Reward:${reward.id}`,
          { updatedData: req.body },
        );
        res.json(reward);
      } catch (error) {
        next(error);
      }
    },

    deleteReward: async (req, res, next) => {
      try {
        const restaurantId = req.context.restaurantId;
        await rewardsService.deleteReward(req.params.id, restaurantId);
        await auditService.log(
          req.user,
          restaurantId,
          "REWARD_DELETED",
          `Reward:${req.params.id}`,
          {},
        );
        res.status(200).json({ message: "Recompensa excluída com sucesso." });
      } catch (error) {
        next(error);
      }
    },

    spinWheel: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const { rewardId } = req.params; // Get rewardId from params
        const { customerId } = req.body; // customerId from body
        const result = await rewardsService.spinWheel(
          rewardId,
          customerId,
          restaurantId,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "WHEEL_SPIN",
          `Reward:${rewardId}/Customer:${customerId}`,
          { result },
        );
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    },

    getRewardsAnalytics: async (req, res, next) => {
      try {
        const restaurantId = req.context.restaurantId;
        const data = await rewardsService.getRewardsAnalytics(restaurantId);
        res.json(data);
      } catch (error) {
        next(error);
      }
    },
  };
};
