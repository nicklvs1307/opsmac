import { BadRequestError, NotFoundError } from "../../utils/errors/index.js";

export default (db) => {

  const getSurveyRewardProgram = async (restaurantId) => {
    const program = await models.SurveyRewardProgram.findOne({
      where: { restaurantId: restaurantId },
    });
    return program;
  };

  const saveSurveyRewardProgram = async (programData, restaurantId) => {
    const { rewards_per_response } = programData;

    let program = await models.SurveyRewardProgram.findOne({
      where: { restaurantId: restaurantId },
    });

    if (program) {
      await program.update({ rewards_per_response });
    } else {
      program = await models.SurveyRewardProgram.create({
        restaurantId,
        rewards_per_response,
      });
    }
    return program;
  };

  return {
    getSurveyRewardProgram,
    saveSurveyRewardProgram,
  };
};
