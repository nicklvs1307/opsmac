const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const surveyController = require('./survey.controller');
const {
    createSurveyValidation,
    updateSurveyValidation,
    updateSurveyStatusValidation
} = require('./survey.validation');

const router = express.Router();

// Rotas de Pesquisas
router.get('/', auth, surveyController.listSurveys);
router.post('/', auth, createSurveyValidation, surveyController.createSurvey);
router.put('/:id', auth, updateSurveyValidation, surveyController.updateSurvey);
router.patch('/:id/status', auth, updateSurveyStatusValidation, surveyController.updateSurveyStatus);
router.delete('/:id', auth, surveyController.deleteSurvey);
router.get('/:id', auth, surveyController.getSurveyById);
router.get('/analytics/:restaurantId', auth, surveyController.getSurveyAnalytics);

module.exports = router;
