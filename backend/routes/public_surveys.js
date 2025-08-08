
const express = require('express');
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /public/surveys/:slug
// @desc    Get a public survey by slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const survey = await models.Survey.findOne({
            where: { slug: req.params.slug, status: 'active' }, // Only active surveys can be accessed publicly
            include: [
                {
                    model: models.Question,
                    as: 'questions',
                    attributes: ['id', 'question_text', 'question_type', 'options', 'order'],
                },
                {
                    model: models.Restaurant,
                    as: 'restaurant',
                    attributes: ['name', 'logo', 'slug'], // Incluir slug do restaurante
                }
            ],
            attributes: ['id', 'title', 'description', 'type', 'slug'],
        });

        if (!survey) {
            return res.status(404).json({ msg: 'Pesquisa não encontrada ou inativa' });
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

            await models.Feedback.create(feedbackData);

            // Se houver um customer_id, atualize as estatísticas do cliente
            if (customer_id) {
                const customer = await models.Customer.findByPk(customer_id);
                if (customer) {
                    await customer.updateStats();
                    console.log(`[Public Survey] Estatísticas do cliente ${customer_id} atualizadas após resposta de pesquisa.`);
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

            let generatedCoupon = null;
            if (survey.reward_id && customer_id) {
                const reward = await models.Reward.findByPk(survey.reward_id);
                if (reward && await reward.canCustomerUse(customer_id)) {
                    const { coupon } = await reward.generateCoupon(customer_id, {
                        coupon_validity_days: survey.coupon_validity_days, // Passando a validade do cupom
                        metadata: {
                            source: 'survey_response',
                            survey_id: survey.id,
                            response_id: newSurveyResponse.id
                        }
                    });
                    generatedCoupon = coupon;
                }
            }

            res.status(201).json({
                msg: 'Respostas enviadas com sucesso!',
                responseId: newSurveyResponse.id,
                coupon: generatedCoupon
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;

            
