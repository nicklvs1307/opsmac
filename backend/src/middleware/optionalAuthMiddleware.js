const jwt = require('jsonwebtoken');
const { models } = require('../config/database');

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

module.exports = { optionalAuth };
