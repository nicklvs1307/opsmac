const { models, sequelize } = require('../config/database');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slugGenerator');

// User Management
exports.createUser = async (userData) => {
  const { name, email, password, phone, role } = userData;

  const existingUser = await models.User.findOne({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('Usuário já existe com este email');
  }

  const user = await models.User.create({ name, email, password, phone, role });
  return user;
};

exports.listUsers = async () => {
  const users = await models.User.findAll({
    attributes: ['id', 'name', 'email', 'role'],
    order: [['name', 'ASC']]
  });
  return users;
};

exports.updateUser = async (userId, updateData) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('Usuário não encontrado');
  }
  await user.update(updateData);
  return user;
};

// Restaurant Management
exports.createRestaurant = async (restaurantData) => {
  const { name, owner_id } = restaurantData;

  const owner = await models.User.findByPk(owner_id);
  if (!owner) {
    throw new BadRequestError('Proprietário não encontrado');
  }

  const restaurant = await models.Restaurant.create({
    ...restaurantData,
    slug: await generateUniqueSlug(models.Restaurant, name),
  });
  return restaurant;
};

exports.listRestaurants = async () => {
  const restaurants = await models.Restaurant.findAll({
    order: [['name', 'ASC']]
  });
  return restaurants;
};

// Module Management
exports.listModules = async () => {
  const modules = await models.Module.findAll({ order: [['displayName', 'ASC']] });
  return modules;
};

exports.getRestaurantModules = async (restaurantId) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId, {
    include: [{ model: models.Module, as: 'modules', attributes: ['id', 'name', 'displayName'] }]
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  return restaurant.modules;
};

exports.updateRestaurantModules = async (restaurantId, moduleIds) => {
  const t = await sequelize.transaction();
  try {
    const restaurant = await models.Restaurant.findByPk(restaurantId, { transaction: t });
    if (!restaurant) {
      throw new NotFoundError('Restaurante não encontrado');
    }

    await restaurant.setModules(moduleIds, { transaction: t });

    await t.commit();

    const updatedRestaurant = await models.Restaurant.findByPk(restaurantId, {
        include: [{ model: models.Module, as: 'modules' }]
    });
    return updatedRestaurant.modules;
  } catch (error) {
    if (t) await t.rollback();
    throw error;
  }
};
