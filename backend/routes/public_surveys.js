const express = require('express');
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /public/surveys/next/:restaurantSlug/:customerId?
// @desc    Get the next survey for a given customer and restaurant
// @access  Public
router.get('/next/:restaurantSlug/:customerId?', async (req, res) => {
    try {
        const { restaurantSlug, customerId } = req.params;

        const restaurant = await models.Restaurant.findOne({
            where: { slug: restaurantSlug },
            attributes: ['id', 'name', 'logo', 'slug', 'settings'],
        });

        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurante não encontrado.' });
        }

        let customer = null;
        if (customerId) {
            customer = await models.Customer.findByPk(customerId, {
                attributes: ['id', 'last_survey_id', 'last_survey_completed_at'],
            });
        }

        const commonSurveyOptions = {
            where: { restaurant_id: restaurant.id, status: 'active' },
            include: [
                {
                    model: models.Question,
                    as: 'questions',
                    attributes: ['id', 'question_text', 'question_type', 'options', 'order'],
                },
                {
                    model: models.Restaurant,
                    as: 'restaurant',
                    attributes: ['name', 'logo', 'slug', 'settings'],
                }
            ],
            attributes: ['id', 'title', 'description', 'type', 'slug', 'rotation_group', 'reward_id', 'coupon_validity_days'],
        };

        let targetSurvey = null;

        // Try to find a survey based on rotation logic
        if (customer && customer.last_survey_id) {
            const lastSurvey = await models.Survey.findByPk(customer.last_survey_id);
            if (lastSurvey && lastSurvey.rotation_group) {
                // Find another survey in the same rotation group
                const surveysInGroup = await models.Survey.findAll({
                    ...commonSurveyOptions,
                    where: {
                        ...commonSurveyOptions.where,
                        rotation_group: lastSurvey.rotation_group,
                        id: { [Op.ne]: lastSurvey.id }, // Not the last one
                    },
                });

                if (surveysInGroup.length > 0) {
                    // Simple rotation: pick the next one in the group, or random if only one left
                    targetSurvey = surveysInGroup[0]; // For simplicity, pick the first available
                }
            }
        }

        // Fallback: if no specific rotation survey found, get a random active one
        if (!targetSurvey) {
            const allActiveSurveys = await models.Survey.findAll({
                ...commonSurveyOptions,
                order: models.sequelize.literal('RANDOM()'), // Get a random one
                limit: 1,
            });
            if (allActiveSurveys.length > 0) {
                targetSurvey = allActiveSurveys[0];
            }
        }

        if (!targetSurvey) {
            return res.status(404).json({ msg: 'Nenhuma pesquisa ativa encontrada para este restaurante.' });
        }

        res.json({ survey: targetSurvey, restaurant: targetSurvey.restaurant });

    } catch (err) {
        console.error('Erro ao buscar próxima pesquisa:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /public/surveys/:restaurantSlug/:surveySlug
// @desc    Get a public survey by restaurant slug and survey slug
// @access  Public
router.get('/:restaurantSlug/:surveySlug', async (req, res) => {
    try {
        const { restaurantSlug, surveySlug } = req.params;

        const restaurant = await models.Restaurant.findOne({
            where: { slug: restaurantSlug },
            attributes: ['id'], // Only need the ID for scoping
        });

        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurante não encontrado.' });
        }

        const survey = await models.Survey.findOne({
            where: {
                slug: surveySlug,
                restaurant_id: restaurant.id, // Scope by restaurant_id
                status: 'active'
            },
            include: [
                {
                    model: models.Question,
                    as: 'questions',
                    attributes: ['id', 'question_text', 'question_type', 'options', 'order'],
                    include: [{
                        model: models.NpsCriterion,
                        as: 'npsCriterion',
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: models.Restaurant,
                    as: 'restaurant',
                    attributes: ['name', 'logo', 'slug', 'settings'],
                }
            ],
            attributes: ['id', 'title', 'description', 'type', 'slug'],
        });

        if (!survey) {
            return res.status(404).json({ msg: 'Pesquisa não encontrada ou inativa para este restaurante.' });
        }

        res.json({ survey, restaurant: survey.restaurant });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /public/surveys/:slug/responses
// @desc    Submit responses for a public survey
// @access  Public
router.post(
    '/:slug/responses',
    [
        body('answers', 'As respostas são obrigatórias').isArray({ min: 1 }),
        body('customer_id').optional().isUUID().withMessage('ID do cliente inválido'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { answers, customer_id } = req.body;
        const surveySlug = req.params.slug;

        try {
            const survey = await models.Survey.findOne({
                where: { slug: surveySlug, status: 'active' },
                include: [{
                    model: models.Question,
                    as: 'questions',
                    include: [{
                        model: models.NpsCriterion,
                        as: 'npsCriterion',
                        attributes: ['id', 'name']
                    }]
                }]
            });

            if (!survey) {
                return res.status(404).json({ msg: 'Pesquisa não encontrada ou inativa' });
            }

            // Validate if all questions in the response belong to the survey
            const surveyQuestionIds = survey.questions.map(q => q.id);
            for (const ans of answers) {
                if (!surveyQuestionIds.includes(ans.question_id)) {
                    return res.status(400).json({ msg: `Pergunta com ID ${ans.question_id} não pertence a esta pesquisa.` });
                }
            }

            const newSurveyResponse = await models.SurveyResponse.create({
                survey_id: survey.id,
                customer_id: customer_id || null,
            });

            let feedbackRating = null;
            let feedbackNpsScore = null;
            let feedbackComment = [];
            let feedbackType = 'general'; // Default type
            let isAnonymous = !customer_id;

            const npsScoresByCriterion = {};

            for (const ans of answers) {
                const question = survey.questions.find(q => q.id === ans.question_id);
                if (question) {
                    if (question.question_type === 'ratings' || question.question_type === 'csat') {
                        feedbackRating = parseInt(ans.answer_value);
                    } else if (question.question_type === 'nps') {
                        feedbackNpsScore = parseInt(ans.answer_value);
                        if (question.npsCriterion) {
                            const criterionId = question.npsCriterion.id;
                            const score = parseInt(ans.answer_value);
                            let category = '';
                            if (score >= 9) {
                                category = 'promoters';
                            } else if (score >= 7) {
                                category = 'passives';
                            } else {
                                category = 'detractors';
                            }

                            if (!npsScoresByCriterion[criterionId]) {
                                npsScoresByCriterion[criterionId] = {
                                    promoters: 0,
                                    passives: 0,
                                    detractors: 0,
                                    total: 0,
                                };
                            }
                            npsScoresByCriterion[criterionId][category]++;
                            npsScoresByCriterion[criterionId].total++;
                        }
                    } else if (question.question_type === 'text' || question.question_type === 'textarea') {
                        feedbackComment.push(ans.answer_value);
                    }
                }
            }

            // Infer feedback_type based on rating/nps_score if not explicitly set
            if (feedbackRating !== null) {
                if (feedbackRating >= 4) {
                    feedbackType = 'compliment';
                } else if (feedbackRating <= 2) {
                    feedbackType = 'complaint';
                }
            } else if (feedbackNpsScore !== null) {
                if (feedbackNpsScore >= 9) {
                    feedbackType = 'compliment'; // Promoters
                } else if (feedbackNpsScore <= 6) {
                    feedbackType = 'complaint'; // Detractors
                }
            }

            const feedbackData = {
                restaurant_id: survey.restaurant_id,
                customer_id: customer_id || null,
                rating: feedbackRating,
                nps_score: feedbackNpsScore,
                comment: feedbackComment.join('\n'), // Join comments if multiple text fields
                feedback_type: feedbackType,
                source: 'web', // Assuming web for public surveys
                is_anonymous: isAnonymous,
                // You can add more fields here if needed, e.g., metadata from req.headers
            };

            // Apenas crie um registro de feedback se uma avaliação (rating) foi fornecida,
            // pois é um campo obrigatório no modelo Feedback.
            if (feedbackRating !== null) {
                await models.Feedback.create(feedbackData);
            }

            // Se houver um customer_id, atualize as estatísticas do cliente
            if (customer_id) {
                const customer = await models.Customer.findByPk(customer_id);
                if (customer) {
                    // Incrementar o novo contador de respostas de pesquisa
                    await customer.increment('survey_responses_count');
                    await customer.reload(); // Recarregar para obter o valor mais recente

                    await customer.updateStats();
                    console.log(`[Public Survey] Estatísticas do cliente ${customer_id} atualizadas após resposta de pesquisa.`);

                    // Update last_survey_id and last_survey_completed_at for the customer
                    await customer.update({
                        last_survey_id: survey.id,
                        last_survey_completed_at: new Date(),
                    });
                    console.log(`[Public Survey] Cliente ${customer_id} atualizado com last_survey_id: ${survey.id}`);
                }
            }

            // Update NPS scores by criterion in Restaurant settings
            const restaurant = await models.Restaurant.findByPk(survey.restaurant_id);
            if (restaurant) {
                const currentNpsScores = restaurant.nps_criteria_scores || {};
                for (const criterionId in npsScoresByCriterion) {
                    if (npsScoresByCriterion.hasOwnProperty(criterionId)) {
                        const newScores = npsScoresByCriterion[criterionId];
                        currentNpsScores[criterionId] = {
                            promoters: (currentNpsScores[criterionId]?.promoters || 0) + newScores.promoters,
                            passives: (currentNpsScores[criterionId]?.passives || 0) + newScores.passives,
                            detractors: (currentNpsScores[criterionId]?.detractors || 0) + newScores.detractors,
                            total: (currentNpsScores[criterionId]?.total || 0) + newScores.total,
                        };
                    }
                }
                await restaurant.update({ nps_criteria_scores: currentNpsScores });
            }

            let rewardData = null;
            // Nova lógica de recompensa por marco de respostas
            if (customer_id && restaurant) {
                const surveyRewardSettings = restaurant.settings?.survey_reward_settings || {};
                const rewardsPerResponse = surveyRewardSettings.rewards_per_response || [];
                const currentResponseCount = customer.survey_responses_count;

                console.log(`[Survey Reward] Verificando recompensas para ${currentResponseCount} respostas.`);

                for (const rewardConfig of rewardsPerResponse) {
                    const responseMilestone = parseInt(rewardConfig.response_count, 10);
                    if (responseMilestone === currentResponseCount) {
                        console.log(`[Survey Reward] Cliente atingiu o marco de ${currentResponseCount} respostas.`);
                        const reward = await models.Reward.findByPk(rewardConfig.reward_id);
                        if (reward) {
                            // Evitar dar a mesma recompensa de marco duas vezes
                            const existingCoupon = await models.Coupon.findOne({
                                where: {
                                    customer_id: customer.id,
                                    reward_id: reward.id,
                                    visit_milestone: responseMilestone, // Usaremos o mesmo campo para rastrear marcos
                                },
                            });

                            if (existingCoupon) {
                                console.log(`[Survey Reward] Cliente já recebeu a recompensa para ${currentResponseCount} respostas.`);
                                continue;
                            }

                            console.log(`[Survey Reward] Gerando recompensa: ${reward.title}`);
                            const { coupon } = await reward.generateCoupon(customer.id, {
                                coupon_validity_days: reward.validity_days || survey.coupon_validity_days,
                                metadata: {
                                    source: 'survey_response_milestone',
                                    survey_id: survey.id,
                                    response_id: newSurveyResponse.id,
                                    milestone: currentResponseCount
                                }
                            });
                            rewardData = { type: 'coupon', details: coupon };
                            break; // Conceder apenas a primeira recompensa correspondente
                        }
                    }
                }
            }

            // Fallback para a lógica antiga de recompensa (se nenhuma recompensa de marco foi ganha)
            if (!rewardData && survey.reward_id && customer_id) {
                 console.log(`[Survey Reward] Nenhuma recompensa de marco encontrada. Verificando recompensa padrão da pesquisa.`);
                const reward = await models.Reward.findByPk(survey.reward_id);
                if (reward && (!reward.canCustomerUse || await reward.canCustomerUse(customer_id))) {
                    if (reward.type === 'coupon') {
                        const { coupon } = await reward.generateCoupon(customer_id, {
                            coupon_validity_days: survey.coupon_validity_days,
                            metadata: {
                                source: 'survey_response',
                                survey_id: survey.id,
                                response_id: newSurveyResponse.id
                            }
                        });
                        rewardData = { type: 'coupon', details: coupon };
                    } else if (reward.type === 'wheel_spin') {
                        rewardData = { type: 'wheel_spin', details: { message: 'Você ganhou um giro na roleta!' } };
                    }
                }
            }

            res.status(201).json({
                msg: 'Respostas enviadas com sucesso!',
                responseId: newSurveyResponse.id,
                reward: rewardData
            });
        } catch (err) {
            console.error('Erro detalhado ao enviar respostas da pesquisa:', err);
            res.status(500).json({
                error: 'Erro ao enviar respostas.',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro inesperado.',
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }
    }
);

// @route   PATCH /public/surveys/responses/:responseId/link-customer
// @desc    Link an anonymous survey response to a customer and grant rewards
// @access  Public
router.patch(
    '/responses/:responseId/link-customer',
    [
        body('customer_id', 'ID do cliente é obrigatório').isUUID(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { responseId } = req.params;
        const { customer_id } = req.body;

        try {
            const surveyResponse = await models.SurveyResponse.findByPk(responseId, {
                include: [{
                    model: models.Survey,
                    as: 'survey',
                    include: [{ model: models.Reward, as: 'reward' }]
                }]
            });

            if (!surveyResponse) {
                return res.status(404).json({ msg: 'Resposta da pesquisa não encontrada.' });
            }

            if (surveyResponse.customer_id) {
                return res.status(400).json({ msg: 'Esta resposta já está vinculada a um cliente.' });
            }

            // Link the customer
            await surveyResponse.update({ customer_id });

            // Now, grant the reward
            const { survey } = surveyResponse;
            let rewardData = null;

            if (survey && survey.reward_id) {
                const reward = survey.reward;
                // Assuming canCustomerUse is a method on the Reward model instance
                if (reward && (!reward.canCustomerUse || await reward.canCustomerUse(customer_id))) {
                    if (reward.type === 'coupon') {
                        const { coupon } = await reward.generateCoupon(customer_id, {
                            coupon_validity_days: survey.coupon_validity_days,
                            metadata: {
                                source: 'survey_response_linked',
                                survey_id: survey.id,
                                response_id: surveyResponse.id
                            }
                        });
                        rewardData = { type: 'coupon', details: coupon };
                    } else if (reward.type === 'wheel_spin') {
                        rewardData = { type: 'wheel_spin', details: { message: 'Você ganhou um giro na roleta!' } };
                    }
                    // Future reward types can be handled here
                }
            }

            // Update customer stats after linking
            const customer = await models.Customer.findByPk(customer_id);
            if (customer) {
                await customer.updateStats();
                await customer.update({
                    last_survey_id: survey.id,
                    last_survey_completed_at: new Date(),
                });
                console.log(`[Link Survey] Estatísticas e última pesquisa do cliente ${customer_id} atualizadas.`);
            }


            res.json({
                msg: 'Pesquisa vinculada com sucesso!',
                reward: rewardData
            });

        } catch (err) {
            console.error('Erro ao vincular cliente à resposta da pesquisa:', err);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;