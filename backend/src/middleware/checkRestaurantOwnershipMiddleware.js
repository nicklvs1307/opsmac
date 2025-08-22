const { models } = require('config/database');

const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId || req.body.restaurant_id;
    
    if (!restaurantId) {
      return res.status(400).json({
        error: 'ID do restaurante é obrigatório'
      });
    }

    // Admins podem acessar qualquer restaurante
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    // Verificar se o usuário está associado a este restaurante
    const isAssociated = req.user.restaurants.some(r => r.id === restaurantId);

    if (!isAssociated) {
      return res.status(403).json({
        error: 'Acesso negado. Você não tem permissão para acessar este restaurante'
      });
    }

    // If the user is an owner/manager and is associated, proceed
    next();
  } catch (error) {
    console.error('Erro ao verificar propriedade do restaurante:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = { checkRestaurantOwnership };
