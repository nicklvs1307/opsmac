const { models } = require('models'); // Assuming 'models' alias works here, or adjust path
const { Op } = require('sequelize');

const checkPermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Acesso negado. Usuário não autenticado.'
      });
    }

    try {
      // Find the role of the authenticated user
      const userRole = await models.Role.findOne({
        where: { name: req.user.role },
        include: [{
          model: models.Permission,
          as: 'permissions',
          through: { attributes: [] } // Don't include the join table attributes
        }]
      });

      if (!userRole) {
        return res.status(403).json({
          error: 'Acesso negado. Função do usuário não encontrada.'
        });
      }

      // Extract permission names from the user's role
      const userPermissions = userRole.permissions.map(p => p.name);

      // Check if the user has any of the required permissions
      const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Acesso negado. Permissões insuficientes.'
      });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de permissão:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor ao verificar permissões.'
      });
    }
  };
};

module.exports = { checkPermissions };