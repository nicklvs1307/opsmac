const { body, query } = require('express-validator');

exports.createFeedbackValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),
  body('nps_score').optional().isInt({ min: 0, max: 10 }).withMessage('NPS deve ser entre 0 e 10'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comentário deve ter no máximo 1000 caracteres'),
  body('feedback_type').optional().isIn(['compliment', 'complaint', 'suggestion', 'general']).withMessage('Tipo de feedback inválido'),
  body('source').isIn(['qrcode', 'whatsapp', 'tablet', 'web', 'email', 'manual']).withMessage('Fonte do feedback inválida'),
  body('table_number').optional().isInt({ min: 1 }).withMessage('Número da mesa deve ser positivo')
];

exports.updateFeedbackValidation = [
  body('status').optional().isIn(['pending', 'reviewed', 'responded', 'resolved', 'archived']).withMessage('Status inválido'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Prioridade inválida'),
  body('response_text').optional().trim().isLength({ max: 1000 }).withMessage('Resposta deve ter no máximo 1000 caracteres'),
  body('internal_notes').optional().trim().isLength({ max: 500 }).withMessage('Notas internas devem ter no máximo 500 caracteres')
];

exports.listFeedbacksValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('status').optional({ checkFalsy: true }).isIn(['pending', 'reviewed', 'responded', 'resolved', 'archived']),
  query('priority').optional({ checkFalsy: true }).isIn(['low', 'medium', 'high', 'urgent']),
  query('rating').optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }),
  query('source').optional({ checkFalsy: true }).isIn(['qrcode', 'whatsapp', 'tablet', 'web', 'email', 'manual']),
  query('feedback_type').optional({ checkFalsy: true }).isIn(['compliment', 'complaint', 'suggestion', 'general']),
  query('start_date').optional({ checkFalsy: true }).isISO8601().withMessage('Data de início inválida'),
  query('end_date').optional({ checkFalsy: true }).isISO8601().withMessage('Data de fim inválida'),
  query('search').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('Termo de busca deve ter no máximo 200 caracteres')
];

exports.respondToFeedbackValidation = [
  body('response_text').trim().isLength({ min: 1, max: 1000 }).withMessage('Resposta deve ter entre 1 e 1000 caracteres')
];
