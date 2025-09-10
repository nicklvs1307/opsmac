const { Op } = require('sequelize');
const { surveyTemplates } = require('../../utils/surveyTemplates');
const { generateUniqueSlug } = require('utils/slugGenerator');
const { BadRequestError, NotFoundError, ForbiddenError } = require('utils/errors');

module.exports = (db) => {
    const models = db;

    const listSurveys = async (restaurant_id, search) => {
        const where = {
            restaurant_id,
            status: { [Op.in]: ['active', 'draft'] }
        };

        if (search) {
            where.title = { [Op.iLike]: `%${search}%` };
        }

        return models.Survey.findAll({
            where,
            include: ['questions']
        });
    };

    const createSurvey = async (type, title, slug, description, questions, status, user_id, restaurant_id) => {
        const existingSurvey = await models.Survey.findOne({ where: { slug } });
        if (existingSurvey) {
            throw new BadRequestError('Este slug já está em uso. Por favor, escolha outro.');
        }

        let surveyData = {};
        let questionsData = [];

        if (type === 'custom') {
            surveyData = { title, description, type, restaurant_id, created_by: user_id, status: status || 'active', slug };
            questionsData = questions;
        } else if (surveyTemplates[type]) {
            const template = surveyTemplates[type];
            surveyData = { ...template, type, restaurant_id, created_by: user_id, status: status || 'active', slug: await generateUniqueSlug(models.Survey, template.title) };
            questionsData = template.questions;
        } else {
            throw new BadRequestError('Tipo de pesquisa inválido');
        }

        const survey = await models.Survey.create(surveyData);

        if (questionsData && questionsData.length > 0) {
            for (const q of questionsData) {
                const questionToCreate = {
                    ...q,
                    survey_id: survey.id,
                };
                if (q.question_type === 'nps' && q.nps_criterion_id) {
                    questionToCreate.nps_criterion_id = q.nps_criterion_id;
                }
                await models.Question.create(questionToCreate);
            }
        }

        return models.Survey.findByPk(survey.id, {
            include: ['questions']
        });
    };

    const updateSurvey = async (id, title, slug, description, questions, status, restaurant_id) => {
        let survey = await models.Survey.findByPk(id);

        if (!survey) {
            throw new NotFoundError('Pesquisa não encontrada');
        }

        const existingSurvey = await models.Survey.findOne({ where: { slug, id: { [Op.ne]: id } } });
        if (existingSurvey) {
            throw new BadRequestError('Este slug já está em uso. Por favor, escolha outro.');
        }

        if (survey.restaurant_id !== restaurant_id) {
            throw new ForbiddenError('Não autorizado a editar esta pesquisa');
        }

        survey.title = title;
        survey.slug = slug;
        survey.description = description;
        if (status) {
            survey.status = status;
        }
        await survey.save();

        await models.Question.destroy({ where: { survey_id: survey.id } });

        if (questions && questions.length > 0) {
            for (const q of questions) {
                const questionToCreate = {
                    ...q,
                    survey_id: survey.id,
                };
                if (q.question_type === 'nps' && q.nps_criterion_id) {
                    questionToCreate.nps_criterion_id = q.nps_criterion_id;
                }
                await models.Question.create(questionToCreate);
            }
        }

        return models.Survey.findByPk(survey.id, {
            include: ['questions']
        });
    };

    const updateSurveyStatus = async (id, status, restaurant_id) => {
        const survey = await models.Survey.findByPk(id);
        if (!survey) {
            throw new NotFoundError('Pesquisa não encontrada');
        }

        if (survey.restaurant_id !== restaurant_id) {
            throw new ForbiddenError('Não autorizado');
        }

        survey.status = status;
        await survey.save();
        return survey;
    };

    const deleteSurvey = async (id, restaurant_id) => {
        const survey = await models.Survey.findByPk(id);

        if (!survey) {
            throw new NotFoundError('Pesquisa não encontrada');
        }

        if (survey.restaurant_id !== restaurant_id) {
            throw new ForbiddenError('Não autorizado a apagar esta pesquisa');
        }

        await survey.destroy();
    };

    const getSurveyById = async (id, restaurant_id) => {
        const survey = await models.Survey.findByPk(id, {
            include: ['questions']
        });

        if (!survey) {
            throw new NotFoundError('Pesquisa não encontrada');
        }

        if (survey.restaurant_id !== restaurant_id) {
            throw new ForbiddenError('Não autorizado a acessar esta pesquisa');
        }

        return survey;
    };

    const getSurveyAnalytics = async (restaurantId) => {
        try {
            const totalResponses = await models.SurveyResponse.count({
                include: [{
                    model: models.Survey,
                    where: { restaurant_id: restaurantId },
                    attributes: []
                }]
            });

            const allAnswers = await models.Answer.findAll({
                include: [{
                    model: models.Question,
                    as: 'question',
                    attributes: ['question_type', 'nps_criterion_id'],
                    include: [{
                        model: models.Survey,
                        where: { restaurant_id: restaurantId },
                        attributes: []
                    }, {
                        model: models.NpsCriterion,
                        as: 'npsCriterion',
                        attributes: ['id', 'name'],
                    }]
                }]
            });

            let npsSum = 0;
            let npsCount = 0;
            let csatSum = 0;
            let csatCount = 0;
            const npsByCriterion = {};

            allAnswers.forEach(answer => {
                if (answer.question) {
                    const value = parseInt(answer.answer_value, 10);
                    if (!isNaN(value)) {
                        if (answer.question.question_type === 'nps') {
                            npsSum += value;
                            npsCount++;

                            const criterionId = answer.question.nps_criterion_id;
                            const criterionName = answer.question.npsCriterion?.name || 'Unknown Criterion';

                            if (criterionId) {
                                if (!npsByCriterion[criterionId]) {
                                    npsByCriterion[criterionId] = {
                                        id: criterionId,
                                        name: criterionName,
                                        promoters: 0,
                                        neutrals: 0,
                                        detractors: 0,
                                        totalResponses: 0,
                                    };
                                }

                                if (value >= 9) {
                                    npsByCriterion[criterionId].promoters++;
                                } else if (value >= 7) {
                                    npsByCriterion[criterionId].neutrals++;
                                } else {
                                    npsByCriterion[criterionId].detractors++;
                                }
                                npsByCriterion[criterionId].totalResponses++;
                            }
                        } else if (answer.question.question_type === 'csat') {
                            csatSum += value;
                            csatCount++;
                        }
                    }
                }
            });

            const npsMetricsPerCriterion = Object.values(npsByCriterion).map(criterion => {
                const { promoters, neutrals, detractors, totalResponses } = criterion;
                const npsScore = totalResponses > 0 ? ((promoters - detractors) / totalResponses) * 100 : null;
                return { ...criterion, npsScore };
            });

            const averageNps = npsCount > 0 ? npsSum / npsCount : null;
            const averageCsat = csatCount > 0 ? csatSum / csatCount : null;

            const restaurant = await models.Restaurant.findByPk(restaurantId);

            return {
                totalResponses,
                averageNps,
                averageCsat,
                npsMetricsPerCriterion,
                npsCriteriaScores: restaurant?.npsCriteriaScores || {}
            };
        } catch (error) {
            console.error("Error in getSurveyAnalytics: ", error);
            throw error;
        }
    };

    const getSurveysComparisonAnalytics = async (restaurantId, surveyIds) => {
        const comparisonData = [];

        for (const surveyId of surveyIds) {
            const survey = await models.Survey.findByPk(surveyId, {
                where: { restaurant_id: restaurantId },
                include: ['questions']
            });

            if (survey) {
                const analytics = await getSurveyAnalytics(restaurantId);
                comparisonData.push({
                    surveyId: survey.id,
                    title: survey.title,
                    totalResponses: analytics.totalResponses,
                    averageNps: analytics.averageNps,
                    averageCsat: analytics.averageCsat,
                    npsMetricsPerCriterion: analytics.npsMetricsPerCriterion,
                });
            }
        }
        return comparisonData;
    };

    const getQuestionAnswersDistribution = async (restaurantId, surveyId, questionId) => {
        const question = await models.Question.findOne({
            where: { id: questionId, survey_id: surveyId },
            include: [{
                model: models.Survey,
                where: { restaurant_id: restaurantId },
                attributes: []
            }]
        });

        if (!question) {
            throw new NotFoundError('Questão não encontrada ou não pertence a este restaurante/pesquisa.');
        }

        const answers = await models.Answer.findAll({
            where: { question_id: questionId },
            attributes: ['answer_value'],
        });

        const distribution = {};
        answers.forEach(answer => {
            const value = answer.answer_value;
            distribution[value] = (distribution[value] || 0) + 1;
        });

        return {
            questionId: question.id,
            questionText: question.question_text,
            questionType: question.question_type,
            distribution,
        };
    };

    return {
        listSurveys,
        createSurvey,
        updateSurvey,
        updateSurveyStatus,
        deleteSurvey,
        getSurveyById,
        getSurveyAnalytics,
        getSurveysComparisonAnalytics,
        getQuestionAnswersDistribution,
    };
};