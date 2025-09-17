import { BadRequestError, NotFoundError } from "../../utils/errors/index.js";
import RewardsService from "../rewards/rewards.service.js";

export default (db) => {
  const rewardsService = RewardsService(db);

  const getSurveyRewardProgram = async (restaurantId) => {
    const program = await db.SurveyRewardProgram.findOne({
      where: { restaurantId: restaurantId },
    });
    return program;
  };

  const saveSurveyRewardProgram = async (programData, restaurantId) => {
    const { rewards_per_response } = programData;

    let program = await db.SurveyRewardProgram.findOne({
      where: { restaurantId: restaurantId },
    });

    if (program) {
      await program.update({ rewards_per_response });
    } else {
      program = await db.SurveyRewardProgram.create({
        restaurantId,
        rewards_per_response,
      });
    }
    return program;
  };

  const grantRewardForSurveyResponse = async (surveyResponse, customer) => {
    const restaurantId = surveyResponse.restaurantId;
    const surveyRewardProgram = await getSurveyRewardProgram(restaurantId);

    if (!surveyRewardProgram) {
      return null;
    }

    const rewardsPerResponse = surveyRewardProgram.rewards_per_response || [];
    const currentResponseCount = customer.survey_responses_count;

    for (const rewardConfig of rewardsPerResponse) {
      const responseMilestone = parseInt(rewardConfig.response_count, 10);
      if (responseMilestone === currentResponseCount) {
        const reward = await db.Reward.findByPk(rewardConfig.reward_id);
        if (reward) {
          const { coupon } = await rewardsService.generateCouponForReward(
            reward,
            customer.id,
            {
              metadata: {
                source: "survey_response_milestone",
                survey_id: surveyResponse.surveyId,
                response_id: surveyResponse.id,
              },
            },
          );
          return { type: "coupon", details: coupon };
        }
      }
    }

    return null;
  };

  return {
    getSurveyRewardProgram,
    saveSurveyRewardProgram,
    grantRewardForSurveyResponse,
  };
};
