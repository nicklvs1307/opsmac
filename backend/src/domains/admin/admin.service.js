const models = require('models');
const { sequelize } = models;
const { BadRequestError, NotFoundError } = require('utils/errors');
const { generateUniqueSlug } = require('utils/slugGenerator');

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
  const { name } = restaurantData;
  let { ownerId } = restaurantData;

  if (!ownerId) {
    const superAdminUser = await models.User.findOne({ where: { role: 'super_admin' } });
    if (superAdminUser) {
      ownerId = superAdminUser.id;
    } else {
      throw new BadRequestError('Proprietário não encontrado e nenhum super_admin disponível para atribuição.');
    }
  }

  const owner = await models.User.findByPk(ownerId);
  if (!owner) {
    throw new BadRequestError('Proprietário não encontrado');
  }

  const restaurant = await models.Restaurant.create({
    ...restaurantData,
    ownerId,
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

exports.updateRestaurant = async (restaurantId, updateData) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }

  if (updateData.ownerId) {
    const newOwner = await models.User.findByPk(updateData.ownerId);
    if (!newOwner) {
      throw new BadRequestError('Novo proprietário não encontrado');
    }
  }

  await restaurant.update(updateData);
  return restaurant;
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
