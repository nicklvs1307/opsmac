module.exports = (db) => {
    const { Survey, Answer, NpsCriterion } = db;
    const { Op } = require('sequelize');
    const { NotFoundError } = require('utils/errors');

    const listSurveys = async (restaurantId, search) => {
        const where = { restaurantId };
        if (search) {
            where.title = { [Op.iLike]: `%${search}%` };
        }

        return Survey.findAll({
            where,
            include: [
                {
                    model: NpsCriterion,
                    as: 'npsCriteria',
                    through: { attributes: [] } // Exclude join table attributes
                }
            ]
        });
    };

    const createSurvey = async (surveyData, restaurantId, userId) => {
        const survey = await Survey.create({ ...surveyData, restaurantId, userId });
        if (surveyData.npsCriteria && surveyData.npsCriteria.length > 0) {
            await survey.setNpsCriteria(surveyData.npsCriteria);
        }
        return survey;
    };

    const getSurveyById = async (surveyId, restaurantId) => {
        const survey = await Survey.findOne({
            where: { id: surveyId, restaurantId },
            include: [
                {
                    model: NpsCriterion,
                    as: 'npsCriteria',
                    through: { attributes: [] }
                }
            ]
        });
        if (!survey) {
            throw new NotFoundError('Pesquisa não encontrada.');
        }
        return survey;
    };

    const updateSurvey = async (surveyId, surveyData, restaurantId) => {
        const survey = await getSurveyById(surveyId, restaurantId);
        await survey.update(surveyData);
        if (surveyData.npsCriteria) {
            await survey.setNpsCriteria(surveyData.npsCriteria);
        }
        return survey;
    };

    const updateSurveyStatus = async (surveyId, status, restaurantId) => {
        const survey = await getSurveyById(surveyId, restaurantId);
        await survey.update({ status });
        return survey;
    };

    const deleteSurvey = async (surveyId, restaurantId) => {
        const survey = await getSurveyById(surveyId, restaurantId);
        await survey.destroy();
        return true;
    };

    const getSurveyAnalytics = async (restaurantId, surveyId) => {
        const survey = await getSurveyById(surveyId, restaurantId);

        const totalAnswers = await Answer.count({
            where: { surveyId }
        });

        // More complex analytics can be added here
        const analytics = {
            totalAnswers,
        };

        return analytics;
    };

    const getSurveysComparisonAnalytics = async (restaurantId, surveyIds) => {
        // Placeholder for more complex comparison logic
        const analytics = await Promise.all(surveyIds.map(id => getSurveyAnalytics(restaurantId, id)));
        return analytics;
    };

    const getQuestionAnswersDistribution = async (restaurantId, surveyId, questionId) => {
        await getSurveyById(surveyId, restaurantId); // Ensures survey belongs to restaurant

        const distribution = await Answer.findAll({
            where: {
                surveyId,
                // This assumes answers are stored in a way that can be grouped.
                // This is a simplified example.
                'answers.questionId': questionId 
            },
            attributes: [
                ['answers.value', 'answer'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            group: ['answers.value']
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