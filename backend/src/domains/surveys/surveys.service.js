import { Op } from "sequelize";
import { BadRequestError, NotFoundError } from "../../utils/errors/index.js";

export default (db) => {

  const listSurveys = async (restaurantId, search) => {
    const where = { restaurantId };
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    return models.Survey.findAll({
      where,
      include: [
        {
          model: db.Question,
          as: "questions",
          include: [
            {
              model: db.NpsCriterion,
              as: "npsCriterion",
            },
          ],
        },
      ],
    });
  };

  const createSurvey = async (surveyData, restaurantId, userId) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const survey = await models.Survey.create(
        { ...surveyData, restaurantId, userId },
        { transaction: t },
      );
      if (surveyData.npsCriteria && surveyData.npsCriteria.length > 0) {
        await survey.setNpsCriteria(surveyData.npsCriteria, { transaction: t });
      }
      await t.commit(); // Commit transaction
      return survey;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const getSurveyById = async (surveyId, restaurantId) => {
    const survey = await models.Survey.findOne({
      where: { id: surveyId, restaurantId },
      include: [
        {
          model: db.Question,
          as: "questions",
          include: [
            {
              model: db.NpsCriterion,
              as: "npsCriterion",
            },
          ],
        },
      ],
    });
    if (!survey) {
      throw new NotFoundError("Pesquisa não encontrada.");
    }
    return survey;
  };

  const updateSurvey = async (surveyId, surveyData, restaurantId) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const survey = await getSurveyById(surveyId, restaurantId); // getSurveyById does not use transaction
      await survey.update(surveyData, { transaction: t });
      if (surveyData.npsCriteria) {
        await survey.setNpsCriteria(surveyData.npsCriteria, { transaction: t });
      }
      await t.commit(); // Commit transaction
      return survey;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const updateSurveyStatus = async (surveyId, status, restaurantId) => {
    const survey = await getSurveyById(surveyId, restaurantId);
    await survey.update({ status });
    return survey;
  };

  const deleteSurvey = async (surveyId, restaurantId) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const survey = await getSurveyById(surveyId, restaurantId); // getSurveyById does not use transaction
      await survey.destroy({ transaction: t });
      await t.commit(); // Commit transaction
      return true;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const getSurveyAnalytics = async (restaurantId, surveyId) => {
    const survey = await getSurveyById(surveyId, restaurantId);

    const totalAnswers = await models.Answer.count({
      where: { surveyId },
    });

    const answersByType = await models.Answer.findAll({
      attributes: [
        [db.sequelize.col("question.type"), "questionType"],
        [db.sequelize.fn("COUNT", db.sequelize.col("Answer.id")), "count"],
      ],
      include: [
        {
          model: db.Question,
          as: "question",
          attributes: [],
          where: { surveyId: surveyId }, // Ensure questions belong to this survey
        },
      ],
      group: ["question.type"],
      raw: true,
    });

    // More complex analytics can be added here
    const analytics = {
      totalAnswers,
      answersByType, // New analytics
    };

    return analytics;
  };

  const getSurveysComparisonAnalytics = async (restaurantId, surveyIds) => {
    // Placeholder for more complex comparison logic
    const analytics = await Promise.all(
      surveyIds.map((id) => getSurveyAnalytics(restaurantId, id)),
    );
    return analytics;
  };

  const getQuestionAnswersDistribution = async (
    restaurantId,
    surveyId,
    questionId,
  ) => {
    await getSurveyById(surveyId, restaurantId); // Ensures survey belongs to restaurant

    const distribution = await models.Answer.findAll({
      where: {
        questionId: questionId, // Filter directly by questionId
      },
      include: [
        {
          model: db.SurveyResponse,
          as: "surveyResponse",
          where: {
            surveyId: surveyId, // Filter by surveyId through SurveyResponse
          },
          attributes: [], // Don't fetch SurveyResponse data
        },
      ],
      attributes: [
        ["value", "answer"], // Use 'value' directly from Answer model
        [db.sequelize.fn("COUNT", db.sequelize.col("Answer.id")), "count"], // Count Answer.id
      ],
      group: ["Answer.value"], // Group by Answer.value
      raw: true, // Get raw data
    });

    return distribution;
  };

  return {
    listSurveys,
    createSurvey,
    getSurveyById,
    updateSurvey,
    updateSurveyStatus,
    deleteSurvey,
    getSurveyAnalytics,
    getSurveysComparisonAnalytics,
    getQuestionAnswersDistribution,
  };
};
