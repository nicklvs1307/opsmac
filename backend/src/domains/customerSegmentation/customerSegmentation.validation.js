const { body } = require('express-validator');

const createSegmentValidation = [
    body('name').notEmpty().withMessage('O nome do segmento é obrigatório.'),
    body('rules').isArray().withMessage('As regras devem ser um array.'),
    // Add more specific validation for rules array elements if needed
];

const updateSegmentValidation = [
    body('name').optional().notEmpty().withMessage('O nome do segmento não pode ser vazio.'),
    body('rules').optional().isArray().withMessage('As regras devem ser um array.'),
];

module.exports = {
    createSegmentValidation,
    updateSegmentValidation,
};