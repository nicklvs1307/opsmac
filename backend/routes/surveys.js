const express = require('express');
const { auth } = require('../middleware/auth');
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { surveyTemplates } = require('../utils/surveyTemplates');
const { generateUniqueSlug } = require('../utils/slugGenerator');

const router = express.Router();

// @route   POST api/surveys
// @desc    Create a new survey from a template or custom
// @access  Private
router.post(
    '/',
    auth,
    [
        body('type', 'O tipo da pesquisa é obrigatório').not().isEmpty(),
        body('title', 'O título é obrigatório para pesquisas personalizadas').if(body('type').equals('custom')).not().isEmpty(),
        body('questions', 'Perguntas são obrigatórias para pesquisas personalizadas').if(body('type').equals('custom')).isArray({ min: 1 }),
        body('status', 'Status inválido').optional().isIn(['draft', 'active', 'inactive', 'archived']),
    ],
    async (req, res) => {
        console.log('Surveys Route - req.user:', req.user);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, title, description, questions, status } = req.body;
        const { userId: user_id, restaurant_id } = req.user;

        try {
            let surveyData = {};
            let questionsData = [];

            if (type === 'custom') {
                surveyData = { title, description, type, restaurant_id, created_by: user_id, status: status || 'active', slug: await generateUniqueSlug(models.Survey, title) };
                questionsData = questions;
            } else if (surveyTemplates[type]) {
                const template = surveyTemplates[type];
                surveyData = { ...template, type, restaurant_id, created_by: user_id, status: status || 'active', slug: await generateUniqueSlug(models.Survey, template.title) };
                questionsData = template.questions;
            } else {
                return res.status(400).json({ msg: 'Tipo de pesquisa inválido' });
            }

            const survey = await models.Survey.create(surveyData);

            if (questionsData && questionsData.length > 0) {
                for (const q of questionsData) {
                    await models.Question.create({
                        ...q,
                        survey_id: survey.id,
                    });
                }
            }

            const newSurvey = await models.Survey.findByPk(survey.id, {
                include: ['questions']
            });

            res.status(201).json(newSurvey);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT /api/surveys/:id
// @desc    Update an existing survey
// @access  Private
router.put(
    '/:id',
    auth,
    [
        body('title', 'O título é obrigatório').not().isEmpty(),
        body('description', 'A descrição é obrigatória').not().isEmpty(),
        body('questions', 'Perguntas são obrigatórias').isArray({ min: 1 }),
        body('status', 'Status inválido').optional().isIn(['draft', 'active', 'inactive', 'archived']),
    ],
    async (req, res) => {
        const errors = validation.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, questions, status } = req.body;
        const { id } = req.params;
        const { restaurant_id } = req.user;

        try {
            let survey = await models.Survey.findByPk(id);

            if (!survey) {
                return res.status(404).json({ msg: 'Pesquisa não encontrada' });
            }

            // Ensure the user owns the survey's restaurant
            if (survey.restaurant_id !== restaurant_id) {
                return res.status(403).json({ msg: 'Não autorizado a editar esta pesquisa' });
            }

            // Update survey details
            survey.title = title;
            survey.description = description;
            if (status) {
                survey.status = status;
            }
            survey.slug = await generateUniqueSlug(models.Survey, title, survey.slug); // Update slug on title change
            await survey.save();

            // Update questions: This is a simplified approach.
            // For a robust solution, you'd compare existing questions,
            // add new ones, update changed ones, and delete removed ones.
            // For now, we'll just delete all existing questions and recreate them.
            await models.Question.destroy({ where: { survey_id: survey.id } });

            if (questions && questions.length > 0) {
                for (const q of questions) {
                    await models.Question.create({
                        ...q,
                        survey_id: survey.id,
                    });
                }
            }

            const updatedSurvey = await models.Survey.findByPk(survey.id, {
                include: ['questions']
            });

            res.json(updatedSurvey);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE /api/surveys/:id
// @desc    Delete a survey
// @access  Private
router.delete(
    '/:id',
    auth,
    async (req, res) => {
        const { id } = req.params;
        const { restaurant_id } = req.user;

        try {
            const survey = await models.Survey.findByPk(id);

            if (!survey) {
                return res.status(404).json({ msg: 'Pesquisa não encontrada' });
            }

            // Ensure the user owns the survey's restaurant
            if (survey.restaurant_id !== restaurant_id) {
                return res.status(403).json({ msg: 'Não autorizado a apagar esta pesquisa' });
            }

            await survey.destroy(); // This will also delete associated questions and responses due to CASCADE

            res.json({ msg: 'Pesquisa removida com sucesso' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET /api/surveys/:id/results
// @desc    Get results for a specific survey
// @access  Private
router.get('/:id/results', auth, async (req, res) => {
    try {
        const survey = await models.Survey.findByPk(req.params.id, {
            include: [
                {
                    model: models.Question,
                    as: 'questions',
                    include: [
                        {
                            model: models.Answer,
                            as: 'answers',
                        }
                    ]
                },
                {
                    model: models.SurveyResponse,
                    as: 'responses',
                    include: [
                        {
                            model: models.Answer,
                            as: 'answers',
                            include: [
                                {
                                    model: models.Question,
                                }
                            ]
                        },
                        {
                            model: models.Customer,
                            as: 'customer',
                            attributes: ['id', 'name', 'email', 'phone']
                        }
                    ]
                }
            ]
        });

        if (!survey) {
            return res.status(404).json({ msg: 'Pesquisa não encontrada' });
        }

        const totalResponses = survey.responses.length;
        let npsScore = null;
        let csatAverage = null;
        let ratingsAverage = null;

        if (totalResponses > 0) {
            // Calculate NPS
            const npsResponses = survey.responses.filter(sr => sr.answers.some(a => a.Question.question_type === 'nps'));
            if (npsResponses.length > 0) {
                let promoters = 0;
                let detractors = 0;
                npsResponses.forEach(sr => {
                    const npsAnswer = sr.answers.find(a => a.Question.question_type === 'nps');
                    if (npsAnswer) {
                        const score = parseInt(npsAnswer.answer_value);
                        if (score >= 9) promoters++;
                        else if (score <= 6) detractors++;
                    }
                });
                npsScore = ((promoters - detractors) / npsResponses.length) * 100;
            }

            // Calculate CSAT
            const csatResponses = survey.responses.filter(sr => sr.answers.some(a => a.Question.question_type === 'csat'));
            if (csatResponses.length > 0) {
                let totalCsatScore = 0;
                csatResponses.forEach(sr => {
                    const csatAnswer = sr.answers.find(a => a.Question.question_type === 'csat');
                    if (csatAnswer) {
                        totalCsatScore += parseInt(csatAnswer.answer_value);
                    }
                });
                csatAverage = totalCsatScore / csatResponses.length;
            }

            // Calculate Ratings Average
            const ratingsResponses = survey.responses.filter(sr => sr.answers.some(a => a.Question.question_type === 'ratings'));
            if (ratingsResponses.length > 0) {
                let totalRatingsScore = 0;
                let totalRatingsCount = 0;
                ratingsResponses.forEach(sr => {
                    sr.answers.filter(a => a.Question.question_type === 'ratings').forEach(a => {
                        totalRatingsScore += parseInt(a.answer_value);
                        totalRatingsCount++;
                    });
                });
                if (totalRatingsCount > 0) {
                    ratingsAverage = totalRatingsScore / totalRatingsCount;
                }
            }
        }

        const results = {
            survey,
            totalResponses,
            npsScore,
            csatAverage,
            ratingsAverage,
        };

        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/surveys
// @desc    Get all surveys for the logged in user's restaurant
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const surveys = await models.Survey.findAll({
            where: { restaurant_id: req.user.restaurant_id },
            include: ['questions']
        });
        res.json(surveys);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/surveys/:id
// @desc    Get a single survey by ID
// @access  Private
router.get(
    '/:id',
    auth,
    async (req, res) => {
        try {
            const survey = await models.Survey.findByPk(req.params.id, {
                include: ['questions']
            });

            if (!survey) {
                return res.status(404).json({ msg: 'Pesquisa não encontrada' });
            }

            // Ensure the user owns the survey's restaurant
            if (survey.restaurant_id !== req.user.restaurant_id) {
                return res.status(403).json({ msg: 'Não autorizado a acessar esta pesquisa' });
            }

            res.json(survey);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET /api/surveys/analytics/:restaurantId
// @desc    Get satisfaction analytics for a restaurant
// @access  Private
router.get('/analytics/:restaurantId', auth, async (req, res) => {
    const { restaurantId } = req.params;

    // Optional: Add checkRestaurantOwnership middleware if needed

    try {
        const totalResponses = await models.SurveyResponse.count({
            include: [{
                model: models.Survey,
                where: { restaurant_id: restaurantId },
                attributes: []
            }]
        });

        // Simplified example for average NPS and CSAT
        // A more accurate implementation would involve complex queries
        const allAnswers = await models.Answer.findAll({
            include: [{
                model: models.Question,
                attributes: ['question_type'],
                include: [{
                    model: models.Survey,
                    where: { restaurant_id: restaurantId },
                    attributes: []
                }]
            }]
        });

        let npsSum = 0;
        let npsCount = 0;
        let csatSum = 0;
        let csatCount = 0;

        allAnswers.forEach(answer => {
            if (answer.Question) {
                const value = parseInt(answer.answer_value, 10);
                if (!isNaN(value)) {
                    if (answer.Question.question_type === 'nps') {
                        npsSum += value;
                        npsCount++;
                    } else if (answer.Question.question_type === 'csat') {
                        csatSum += value;
                        csatCount++;
                    }
                }
            }
        });

        const averageNps = npsCount > 0 ? npsSum / npsCount : null;
        const averageCsat = csatCount > 0 ? csatSum / csatCount : null;

        res.json({
            totalResponses,
            averageNps,
            averageCsat
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;