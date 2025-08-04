
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
                include: [{ model: models.Question, as: 'questions' }]
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

            for (const ans of answers) {
                const question = survey.questions.find(q => q.id === ans.question_id);
                if (question) {
                    if (question.question_type === 'ratings' || question.question_type === 'csat') {
                        feedbackRating = parseInt(ans.answer_value);
                    } else if (question.question_type === 'nps') {
                        feedbackNpsScore = parseInt(ans.answer_value);
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

            const answerRecords = answers.map(ans => ({
                response_id: newSurveyResponse.id,
                question_id: ans.question_id,
                answer_value: String(ans.answer_value),
            }));

            await models.Answer.bulkCreate(answerRecords);

            let generatedCoupon = null;
            if (survey.reward_id && customer_id) {
                const reward = await models.Reward.findByPk(survey.reward_id);
                if (reward && await reward.canCustomerUse(customer_id)) {
                    const { coupon } = await reward.generateCoupon(customer_id, {
                        coupon_validity_days: survey.coupon_validity_days, // Passando a validade do cupom
                        metadata: {
                            source: 'survey_response',
                            survey_id: surveyId,
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
