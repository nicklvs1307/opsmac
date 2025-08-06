const jwt = require('jsonwebtoken');
const { models } = require('../config/database');

// Middleware de autenticação
const auth = async (req, res, next) => {
  try {
    // Obter token do header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Acesso negado. Token não fornecido'
      });
    }

    // Verificar formato do token (Bearer <token>)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Acesso negado. Token inválido'
      });
    }

    // Verificar e decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expirado'
        });
      }
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    // Verificar se usuário existe e está ativo
    const user = await models.User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Conta desativada'
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      restaurant_id: null // Default to null
    };

    // Se o usuário for um 'owner' ou 'manager', buscar o restaurant_id associado
    if (user.role === 'owner' || user.role === 'manager') {
      const restaurant = await models.Restaurant.findOne({ where: { owner_id: user.id } });
      if (restaurant) {
        req.user.restaurant_id = restaurant.id;
      }
    }
    console.log('Auth Middleware - req.user (after population):', req.user);

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar roles específicos
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Acesso negado. Usuário não autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso negado. Permissões insuficientes'
      });
    }

    next();
  };
};

// Middleware para verificar se o usuário é dono do restaurante
const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId || req.body.restaurant_id;
    
    if (!restaurantId) {
      return res.status(400).json({
        error: 'ID do restaurante é obrigatório'
      });
    }

    // Admins podem acessar qualquer restaurante
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar se o usuário é dono do restaurante
    const restaurant = await models.Restaurant.findOne({
      where: {
        id: restaurantId,
        owner_id: req.user.userId
      }
    });

    if (!restaurant) {
      return res.status(403).json({
        error: 'Acesso negado. Você não tem permissão para acessar este restaurante'
      });
    }

    // Adicionar restaurante à requisição
    req.restaurant = restaurant;
    next();
  } catch (error) {
    console.error('Erro ao verificar propriedade do restaurante:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware opcional de autenticação (não falha se não houver token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await models.User.findByPk(decoded.userId);
      
      if (user && user.is_active) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        };
      }
    } catch (error) {
      // Ignorar erros de token em auth opcional
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação opcional:', error);
    next(); // Continuar mesmo com erro
  }
};

// Middleware para rate limiting baseado em usuário
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.userId || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpar requests antigos
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    }
    
    // Verificar limite
    const userRequests = requests.get(userId) || [];
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Muitas requisições. Tente novamente mais tarde',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Adicionar requisição atual
    userRequests.push(now);
    requests.set(userId, userRequests);
    
    next();
  };
};

// Middleware para logging de ações do usuário
const logUserAction = (action) => {
  return (req, res, next) => {
    // Adicionar log da ação
    req.userAction = {
      action,
      userId: req.user?.userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      method: req.method,
      url: req.originalUrl,
      body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
    };
    
    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${req.userAction.timestamp.toISOString()}] ${action} - User: ${req.user?.userId || 'Anonymous'} - ${req.method} ${req.originalUrl}`);
    }
    
    next();
  };
};

// Middleware para verificar subscription do restaurante
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

module.exports = {
  auth,
  authorize,
  checkRestaurantOwnership,
  optionalAuth,
  userRateLimit,
  logUserAction,
  checkSubscription
};