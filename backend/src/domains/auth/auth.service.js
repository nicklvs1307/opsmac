const { models } = require('../../config/database');
const { Module } = models;
const { generateToken } = require('services/jwtService');
const { UnauthorizedError, ForbiddenError, NotFoundError } = require('utils/errors');
const permissionService = require('../../domains/permission/permission.service');

const login = async (email, password) => {
  let user = await models.User.findOne({
    where: { email },
    include: [{ model: models.Role, as: 'role' }]
  });

  if (!user) {
    throw new UnauthorizedError('Credenciais inválidas');
  }

  if (user.isLocked()) {
    throw new ForbiddenError('Conta temporariamente bloqueada devido a muitas tentativas de login');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Conta desativada. Entre em contato com o suporte');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw new UnauthorizedError('Credenciais inválidas');
  }

  await user.resetLoginAttempts();

  // Re-fetch user with details based on role
  if (user.role !== 'super_admin') {
    user = await models.User.findOne({
      where: { email },
      include: [
        ...models.User.withRestaurantDetails(models),
        { model: models.Role, as: 'role' }
      ]
    });
  }

  const token = generateToken(user.id);

  let userPermissions = [];
  const userRole = await models.Role.findOne({ where: { name: user.role.name } });
  if (userRole) {
    const permissions = await permissionService.getRolePermissions(userRole.id);
    userPermissions = permissions.map(p => p.name);
  }

  // O serviço retorna os dados, não o objeto de resposta final
  if (user.role === 'super_admin') {
    const allModules = await models.Module.findAll({ attributes: ['name', 'displayName'] });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.isActive,
        last_login: user.lastLogin,
        modules: allModules.map(m => m.name), // Map to array of names
        permissions: userPermissions, // Add permissions
      }
    };
  } else {
    const allRestaurants = user.ownedRestaurants || [];
    if (user.restaurant && !allRestaurants.find(r => r.id === user.restaurant.id)) {
      allRestaurants.push(user.restaurant);
    }
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.isActive,
        last_login: user.lastLogin,
        restaurants: allRestaurants,
        restaurant: user.restaurant || (allRestaurants.length > 0 ? allRestaurants[0] : null),
        permissions: userPermissions, // Add permissions
      }
    };
  }
};

const getMe = async (userId) => {
    let user = await models.User.findByPk(userId, {
        include: [{ model: models.Role, as: 'role' }]
    });

    if (!user) {
        throw new NotFoundError('Usuário não encontrado');
    }

    if (user.role !== 'super_admin') {
        user = await models.User.findByPk(userId, {
            include: [
                ...models.User.withRestaurantDetails(models),
                { model: models.Role, as: 'role' }
            ]
        });
    }

    if (user.role === 'super_admin') {
        const allModules = await models.Module.findAll({ attributes: ['name', 'displayName'] });
        let userPermissions = [];
        const userRole = await models.Role.findOne({ where: { name: user.role.name } });
        if (userRole) {
            const permissions = await permissionService.getRolePermissions(userRole.id);
            userPermissions = permissions.map(p => p.name);
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            is_active: user.isActive,
            email_verified: user.emailVerified,
            last_login: user.lastLogin,
            modules: allModules.map(m => m.name),
            permissions: userPermissions,
        };
    }

    const allRestaurants = user.ownedRestaurants || [];
    if (user.restaurant && !allRestaurants.find(r => r.id === user.restaurant.id)) {
        allRestaurants.push(user.restaurant);
    }
    
    let userPermissions = [];
    const userRole = await models.Role.findOne({ where: { name: user.role.name } });
    if (userRole) {
        const permissions = await permissionService.getRolePermissions(userRole.id);
        userPermissions = permissions.map(p => p.name);
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        is_active: user.isActive,
        email_verified: user.emailVerified,
        last_login: user.lastLogin,
        restaurants: allRestaurants,
        restaurant: user.restaurant || (allRestaurants.length > 0 ? allRestaurants[0] : null),
        permissions: userPermissions,
    };
};

const updateProfile = async (userId, profileData) => {
    const user = await models.User.findByPk(userId);

    if (!user) {
        throw new NotFoundError('Usuário não encontrado');
    }

    await user.update(profileData);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
    };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await models.User.findByPk(userId);

    if (!user) {
        throw new NotFoundError('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Senha atual incorreta');
    }

    await user.update({ password: newPassword });
};


module.exports = {
  login,
  getMe,
  updateProfile,
  changePassword,
};
