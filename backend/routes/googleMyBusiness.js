const express = require('express');
const { auth } = require('../middleware/auth');
const GoogleMyBusinessService = require('../utils/googleMyBusinessService');
const { models } = require('../config/database');

const router = express.Router();

// Middleware para verificar se o módulo Google My Business está habilitado
async function checkGMBModuleEnabled(req, res, next) {
  const restaurantId = req.user?.restaurants?.[0]?.id;

  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
  }

  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant || !restaurant.settings?.enabled_modules?.includes('google_my_business_integration')) {
    console.warn(`Módulo Google My Business não habilitado para o restaurante ${restaurantId}.`);
    return res.status(403).json({ error: 'Google My Business integration module not enabled for this restaurant.' });
  }
  req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição
  next();
}

// @route   GET /api/google-my-business/auth-url
// @desc    Get Google My Business OAuth2 authorization URL
// @access  Private
router.get('/auth-url', auth, checkGMBModuleEnabled, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const gmbService = new GoogleMyBusinessService(restaurantId);
    await gmbService.initializeOAuthClient();
    const authUrl = gmbService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error getting GMB auth URL:', error.message);
    res.status(500).json({ error: 'Erro ao obter URL de autorização do Google My Business.' });
  }
});

// @route   GET /api/google-my-business/oauth2callback
// @desc    Google My Business OAuth2 callback
// @access  Public (called by Google)
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Código de autorização não fornecido.' });
  }

  // TODO: Precisamos de uma forma de associar este callback ao restaurante correto.
  // Uma solução seria passar o restaurantId no state do OAuth URL, mas isso requer mais complexidade.
  // Por enquanto, vamos assumir que o restaurantId pode ser inferido ou que o usuário está logado no frontend
  // e o frontend fará uma chamada subsequente para salvar os tokens.
  // Para simplificar o teste inicial, vamos usar um restaurantId fixo ou o primeiro encontrado.

  try {
    // A forma mais segura seria o frontend iniciar o fluxo OAuth e enviar o code para o backend
    // junto com o restaurantId. Por simplicidade, vamos tentar buscar um restaurante.
    const restaurant = await models.Restaurant.findOne(); // Apenas para teste, NÃO USAR EM PRODUÇÃO
    if (!restaurant) {
      return res.status(404).json({ error: 'Nenhum restaurante encontrado para processar o callback.' });
    }

    const gmbService = new GoogleMyBusinessService(restaurant.id);
    await gmbService.initializeOAuthClient();
    await gmbService.getTokensAndSave(code);

    // Redirecionar de volta para o frontend, talvez para uma página de sucesso
    res.redirect(process.env.FRONTEND_URL + '/integrations?status=success&integration=google-my-business');
  } catch (error) {
    console.error('Error processing GMB OAuth2 callback:', error.message);
    res.redirect(process.env.FRONTEND_URL + '/integrations?status=error&integration=google-my-business');
  }
});

// @route   GET /api/google-my-business/locations
// @desc    Get Google My Business locations
// @access  Private
router.get('/locations', auth, checkGMBModuleEnabled, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const gmbService = new GoogleMyBusinessService(restaurantId);
    await gmbService.initializeOAuthClient();
    const locations = await gmbService.getLocations();
    res.json({ locations });
  } catch (error) {
    console.error('Error getting GMB locations:', error.message);
    res.status(500).json({ error: 'Erro ao obter locais do Google My Business.' });
  }
});

// @route   GET /api/google-my-business/locations/:locationName/reviews
// @desc    Get Google My Business reviews for a specific location
// @access  Private
router.get('/locations/:locationName/reviews', auth, checkGMBModuleEnabled, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const { locationName } = req.params;
    const gmbService = new GoogleMyBusinessService(restaurantId);
    await gmbService.initializeOAuthClient();
    const reviews = await gmbService.getReviews(`locations/${locationName}`);
    res.json({ reviews });
  } catch (error) {
    console.error('Error getting GMB reviews:', error.message);
    res.status(500).json({ error: 'Erro ao obter avaliações do Google My Business.' });
  }
});

// @route   POST /api/google-my-business/locations/:locationName/reviews/:reviewName/reply
// @desc    Reply to a Google My Business review
// @access  Private
router.post('/locations/:locationName/reviews/:reviewName/reply', auth, checkGMBModuleEnabled, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const { locationName, reviewName } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ error: 'Comentário da resposta é obrigatório.' });
    }

    const gmbService = new GoogleMyBusinessService(restaurantId);
    await gmbService.initializeOAuthClient();
    const reply = await gmbService.replyToReview(`locations/${locationName}/reviews/${reviewName}`, comment);
    res.json({ reply });
  } catch (error) {
    console.error('Error replying to GMB review:', error.message);
    res.status(500).json({ error: 'Erro ao responder à avaliação do Google My Business.' });
  }
});

module.exports = router;
