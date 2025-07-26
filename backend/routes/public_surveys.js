
const express = require('express');
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /public/surveys/:id
// @desc    Get a public survey by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const survey = await models.Survey.findByPk(req.params.id, {
            where: { status: 'active' }, // Only active surveys can be accessed publicly
            include: [
                {
                    model: models.Question,
                    as: 'questions',
                    attributes: ['id', 'question_text', 'question_type', 'options', 'order'],
                }
            ],
            attributes: ['id', 'title', 'description', 'type'],
        });

        if (!survey) {
            return res.status(404).json({ msg: 'Pesquisa não encontrada ou inativa' });
        }

        res.json(survey);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /public/surveys/:id/responses
// @desc    Submit responses for a public survey
// @access  Public
router.post(
    '/:id/responses',
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
        const surveyId = req.params.id;

        try {
            const survey = await models.Survey.findByPk(surveyId, {
                where: { status: 'active' },
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
                survey_id: surveyId,
                customer_id: customer_id || null,
            });

            const answerRecords = answers.map(ans => ({
                response_id: newSurveyResponse.id,
                question_id: ans.question_id,
                answer_value: String(ans.answer_value),
            }));

            await models.Answer.bulkCreate(answerRecords);

            res.status(201).json({ msg: 'Respostas enviadas com sucesso!', responseId: newSurveyResponse.id });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;
