const express = require('express');
const { auth } = require('../middleware/auth');
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { surveyTemplates } = require('../utils/surveyTemplates');
const { generateUniqueSlug } = require('../utils/slugGenerator');

const router = express.Router();

// @route   GET api/surveys
// @desc    Get all surveys for the logged in user's restaurant
// @access  Private
router.get('/', auth, async (req, res) => {
    const { search } = req.query;
    const { restaurant_id } = req.user;

    try {
        const where = {
            restaurant_id,
            status: { [models.Sequelize.Op.in]: ['active', 'draft'] }
        };

        if (search) {
            where.title = { [models.Sequelize.Op.iLike]: `%${search}%` };
        }

        const surveys = await models.Survey.findAll({
            where,
            include: ['questions']
        });
        res.json(surveys);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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
        body('slug', 'Slug é obrigatório e deve ser único').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, title, slug, description, questions, status } = req.body;
        const { userId: user_id, restaurant_id } = req.user;

        try {
            // Verificar se o slug já existe
            const existingSurvey = await models.Survey.findOne({ where: { slug } });
            if (existingSurvey) {
                return res.status(400).json({ errors: [{ msg: 'Este slug já está em uso. Por favor, escolha outro.' }] });
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
                return res.status(400).json({ msg: 'Tipo de pesquisa inválido' });
            }

            const survey = await models.Survey.create(surveyData);

            if (questionsData && questionsData.length > 0) {
                for (const q of questionsData) {
                    const questionToCreate = {
                        ...q,
                        survey_id: survey.id,
                    };
                    // Apenas adicione nps_criterion_id se for uma pergunta NPS
                    if (q.question_type === 'nps' && q.nps_criterion_id) {
                        questionToCreate.nps_criterion_id = q.nps_criterion_id;
                    }
                    await models.Question.create(questionToCreate);
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
        body('slug', 'Slug é obrigatório e deve ser único').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, slug, description, questions, status } = req.body;
        const { id } = req.params;
        const { restaurant_id } = req.user;

        try {
            let survey = await models.Survey.findByPk(id);

            if (!survey) {
                return res.status(404).json({ msg: 'Pesquisa não encontrada' });
            }

            // Verificar se o novo slug já existe em outra pesquisa
            const existingSurvey = await models.Survey.findOne({ where: { slug, id: { [models.Sequelize.Op.ne]: id } } });
            if (existingSurvey) {
                return res.status(400).json({ errors: [{ msg: 'Este slug já está em uso. Por favor, escolha outro.' }] });
            }

            // Ensure the user owns the survey's restaurant
            if (survey.restaurant_id !== restaurant_id) {
                return res.status(403).json({ msg: 'Não autorizado a editar esta pesquisa' });
            }

            // Update survey details
            survey.title = title;
            survey.slug = slug;
            survey.description = description;
            if (status) {
                survey.status = status;
            }
            await survey.save();

            // Update questions: This is a simplified approach.
            // For a robust solution, you'd compare existing questions,
            // add new ones, update changed ones, and delete removed ones.
            // For now, we'll just delete all existing questions and recreate them.
            await models.Question.destroy({ where: { survey_id: survey.id } });

            if (questions && questions.length > 0) {
                for (const q of questions) {
                    const questionToCreate = {
                        ...q,
                        survey_id: survey.id,
                    };
                    // Apenas adicione nps_criterion_id se for uma pergunta NPS
                    if (q.question_type === 'nps' && q.nps_criterion_id) {
                        questionToCreate.nps_criterion_id = q.nps_criterion_id;
                    }
                    await models.Question.create(questionToCreate);
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

// @route   PATCH /api/surveys/:id/status
// @desc    Update survey status
// @access  Private
router.patch('/:id/status', auth, [
    body('status', 'Status é obrigatório').isIn(['active', 'draft']).not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const survey = await models.Survey.findByPk(req.params.id);
        if (!survey) {
            return res.status(404).json({ msg: 'Pesquisa não encontrada' });
        }

        if (survey.restaurant_id !== req.user.restaurant_id) {
            return res.status(403).json({ msg: 'Não autorizado' });
        }

        survey.status = req.body.status;
        await survey.save();
        res.json(survey);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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


// @route   GET /api/surveys/analytics/:restaurantId
// @desc    Get satisfaction analytics for a restaurant
// @access  Private
router.get('/analytics/:restaurantId', auth, async (req, res) => {
    const { restaurantId } = req.params;

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