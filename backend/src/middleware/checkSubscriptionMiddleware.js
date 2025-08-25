const { models } = require('config/config');

const checkSubscription = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId || req.body.restaurant_id || req.restaurant?.id;
    
    if (!restaurantId) {
      return next(); // Pular verificação se não há restaurante
    }

    const restaurant = req.restaurant || await models.Restaurant.findByPk(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurante não encontrado'
      });
    }

    if (!restaurant.isSubscriptionActive()) {
      return res.status(402).json({
        error: 'Subscription expirada. Renove seu plano para continuar usando o serviço',
        subscription_plan: restaurant.subscription_plan,
        subscription_expires: restaurant.subscription_expires
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar subscription:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = { checkSubscription };
