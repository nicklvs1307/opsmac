module.exports = (db) => {
    const { Survey, Answer, NpsCriterion } = db;

    const listSurveys = async (restaurantId) => {
        try {
            const surveys = await Survey.findAll({
                where: { restaurantId },
                include: [
                    {
                        model: NpsCriterion,
                        as: 'npsCriteria',
                        through: { attributes: [] } // Exclude join table attributes
                    }
                ]
            });
            return surveys;
        } catch (error) {
            console.error('Error listing surveys:', error);
            throw new Error('Failed to list surveys');
        }
    };

    const createSurvey = async (surveyData, restaurantId) => {
        try {
            const survey = await Survey.create({ ...surveyData, restaurantId });
            if (surveyData.npsCriteria && surveyData.npsCriteria.length > 0) {
                await survey.setNpsCriteria(surveyData.npsCriteria);
            }
            return survey;
        } catch (error) {
            console.error('Error creating survey:', error);
            throw new Error('Failed to create survey');
        }
    };

    const getSurveyById = async (surveyId, restaurantId) => {
        try {
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
            return survey;
        } catch (error) {
            console.error('Error getting survey by ID:', error);
            throw new Error('Failed to get survey by ID');
        }
    };

    const updateSurvey = async (surveyId, surveyData, restaurantId) => {
        try {
            const survey = await Survey.findOne({ where: { id: surveyId, restaurantId } });
            if (!survey) {
                return null;
            }
            await survey.update(surveyData);
            if (surveyData.npsCriteria) {
                await survey.setNpsCriteria(surveyData.npsCriteria);
            }
            return survey;
        } catch (error) {
            console.error('Error updating survey:', error);
            throw new Error('Failed to update survey');
        }
    };

    const deleteSurvey = async (surveyId, restaurantId) => {
        try {
            const survey = await Survey.findOne({ where: { id: surveyId, restaurantId } });
            if (!survey) {
                return false;
            }
            await survey.destroy();
            return true;
        } catch (error) {
            console.error('Error deleting survey:', error);
            throw new Error('Failed to delete survey');
        }
    };

    const getSurveyAnswers = async (surveyId, restaurantId) => {
        try {
            const answers = await Answer.findAll({
                where: { surveyId },
                include: [{
                    model: Survey,
                    as: 'survey',
                    where: { restaurantId },
                    attributes: []
                }]
            });
            return answers;
        } catch (error) {
            console.error('Error getting survey answers:', error);
            throw new Error('Failed to get survey answers');
        }
    };

    const getSurveyWithAnswers = async (surveyId, restaurantId) => {
        try {
            const survey = await Survey.findOne({
                where: { id: surveyId, restaurantId },
                include: [
                    {
                        model: Answer,
                        as: 'answers'
                    },
                    {
                        model: NpsCriterion,
                        as: 'npsCriteria',
                        through: { attributes: [] }
                    }
                ]
            });
            return survey;
        } catch (error) {
            console.error('Error getting survey with answers:', error);
            throw new Error('Failed to get survey with answers');
        }
    };

    const getSurveyAnalytics = async (surveyId, restaurantId) => {
        try {
            const survey = await Survey.findOne({
                where: { id: surveyId, restaurantId }
            });
            if (!survey) {
                return null;
            }

            const answers = await Answer.findAll({
                where: { surveyId }
            });

            // Basic analytics example: count answers
            const analytics = {
                totalAnswers: answers.length,
                // More complex analytics can be added here
            };

            return analytics;
        } catch (error) {
            console.error('Error getting survey analytics:', error);
            throw new Error('Failed to get survey analytics');
        }
    };

    const getAllAnswersForRestaurant = async (restaurantId) => {
        try {
            const answers = await Answer.findAll({
                include: [{
                    model: Survey,
                    as: 'survey',
                    where: { '$survey.restaurant_id$': restaurantId },
                }],
            });
            return answers;
        } catch (error) {
            console.error('Error getting all answers for restaurant:', error);
            throw new Error('Failed to get all answers for restaurant');
        }
    };

    return {
        listSurveys,
        createSurvey,
        getSurveyById,
        updateSurvey,
        deleteSurvey,
        getSurveyAnswers,
        getSurveyWithAnswers,
        getSurveyAnalytics,
        getAllAnswersForRestaurant,
    };
};