const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService");

module.exports = (db) => {
  const surveyRewardProgramService = require("./surveyRewardProgram.service")(
    db,
  );

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    getSurveyRewardProgram: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const program =
        await surveyRewardProgramService.getSurveyRewardProgram(restaurantId);
      res.json(program);
    },

    saveSurveyRewardProgram: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const program = await surveyRewardProgramService.saveSurveyRewardProgram(
        req.body,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "SURVEY_REWARD_PROGRAM_SAVED",
        `Program:${program.id}`,
        { data: req.body },
      );
      res.status(200).json(program);
    },
  };
};
