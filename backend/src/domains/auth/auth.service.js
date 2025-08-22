const { models } = require('../../config/database');
const { generateToken } = require('../../services/jwtService');
const { UnauthorizedError, ForbiddenError, NotFoundError } = require('../../utils/errors');

const login = async (email, password) => {
  const user = await models.User.findOne({
    where: { email },
    ...models.User.withRestaurantDetails(models)
  });

  if (!user) {
    throw new UnauthorizedError('Credenciais inválidas');
  }

  if (user.isLocked()) {
    throw new ForbiddenError('Conta temporariamente bloqueada devido a muitas tentativas de login');
  }

  if (!user.is_active) {
    throw new UnauthorizedError('Conta desativada. Entre em contato com o suporte');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw new UnauthorizedError('Credenciais inválidas');
  }

  await user.resetLoginAttempts();

  const token = generateToken(user.id);

  const allRestaurants = user.owned_restaurants || [];
  if (user.restaurant && !allRestaurants.find(r => r.id === user.restaurant.id)) {
    allRestaurants.push(user.restaurant);
  }

  // O serviço retorna os dados, não o objeto de resposta final
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      last_login: user.last_login,
      restaurants: allRestaurants,
      restaurant: user.restaurant || (allRestaurants.length > 0 ? allRestaurants[0] : null)
    }
  };
};

const getMe = async (userId) => {
    const user = await models.User.findByPk(userId, {
        ...models.User.withRestaurantDetails(models)
    });

    if (!user) {
        throw new NotFoundError('Usuário não encontrado');
    }

    const allRestaurants = user.owned_restaurants || [];
    if (user.restaurant && !allRestaurants.find(r => r.id === user.restaurant.id)) {
        allRestaurants.push(user.restaurant);
    }
    
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        is_active: user.is_active,
        email_verified: user.email_verified,
        last_login: user.last_login,
        restaurants: allRestaurants,
        restaurant: user.restaurant || (allRestaurants.length > 0 ? allRestaurants[0] : null)
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
