'use strict';
const { User, Permission, Role, Restaurant, Module } = require('../../models'); // Ajuste o caminho conforme sua estrutura

/**
 * Middleware para verificar se o usuário tem a permissão necessária para acessar uma rota.
 * Leva em consideração a função do usuário, os módulos ativos do restaurante e as permissões específicas.
 * @param {string} requiredPermission - O nome da permissão necessária (ex: 'products:create').
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Asumimos que o usuário já foi autenticado e está disponível em req.user
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      // Buscar o usuário com todas as associações necessárias do banco de dados
      const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Asumimos que o usuário já foi autenticado e está disponível em req.user
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      console.log('User in checkPermission:', JSON.stringify(req.user, null, 2));
      console.log('Required Permission:', requiredPermission);

      // Buscar o usuário com todas as associações necessárias do banco de dados
      // This fetch is redundant if authMiddleware already includes role and restaurant
      // However, for robustness, we keep it for now.
      const user = await User.findByPk(req.user.userId, {
        include: [
          {
            model: Role,
            as: 'role',
            include: {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] } // Não incluir a tabela de junção
            }
          },
          {
            model: Restaurant,
            as: 'restaurant',
            include: {
              model: Module,
              as: 'modules',
              through: { attributes: [] }
            }
          }
        ]
      });

      if (!user || !user.role) {
        return res.status(403).json({ message: 'Forbidden: User has no assigned role.' });
      }

      console.log('User role name:', user.role.name);
      // O Super Admin tem acesso irrestrito
      if (user.role.name === 'super_admin') {
        return next();
      }

      // Verificar se a função do usuário possui a permissão necessária
      const userPermissions = user.role.permissions.map(p => p.name);
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: `Forbidden: You do not have the required permission (${requiredPermission}).` });
      }

      // Agora, verificar se a permissão está atrelada a um módulo e se esse módulo está ativo
      const permissionDetails = await Permission.findOne({ where: { name: requiredPermission } });

      // Se a permissão não existe ou não requer um módulo, o acesso é concedido
      if (!permissionDetails || !permissionDetails.moduleId) {
        return next();
      }

      // Se a permissão requer um módulo, verificar se o restaurante do usuário tem o módulo ativo
      if (!user.restaurant) {
        return res.status(403).json({ message: 'Forbidden: This action requires a restaurant context.' });
      }

      const activeModuleIds = user.restaurant.modules.map(m => m.id);
      if (!activeModuleIds.includes(permissionDetails.moduleId)) {
        return res.status(403).json({ message: `Forbidden: The module required for this action is not enabled for your restaurant.` });
      }

      // Se todas as verificações passaram, permitir o acesso
      next();
    } catch (error) {
      console.error('Error in checkPermission middleware:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};

      if (!user || !user.role) {
        return res.status(403).json({ message: 'Forbidden: User has no assigned role.' });
      }

      // O Super Admin tem acesso irrestrito
      if (user.role.name === 'super_admin') {
        return next();
      }

      // Verificar se a função do usuário possui a permissão necessária
      const userPermissions = user.role.permissions.map(p => p.name);
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: `Forbidden: You do not have the required permission (${requiredPermission}).` });
      }

      // Agora, verificar se a permissão está atrelada a um módulo e se esse módulo está ativo
      const permissionDetails = await Permission.findOne({ where: { name: requiredPermission } });

      // Se a permissão não existe ou não requer um módulo, o acesso é concedido
      if (!permissionDetails || !permissionDetails.moduleId) {
        return next();
      }

      // Se a permissão requer um módulo, verificar se o restaurante do usuário tem o módulo ativo
      if (!user.restaurant) {
        return res.status(403).json({ message: 'Forbidden: This action requires a restaurant context.' });
      }

      const activeModuleIds = user.restaurant.modules.map(m => m.id);
      if (!activeModuleIds.includes(permissionDetails.moduleId)) {
        return res.status(403).json({ message: `Forbidden: The module required for this action is not enabled for your restaurant.` });
      }

      // Se todas as verificações passaram, permitir o acesso
      next();
    } catch (error) {
      console.error('Error in checkPermission middleware:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};

module.exports = checkPermission;
