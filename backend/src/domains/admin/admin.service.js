const models = require('models');
const { sequelize } = models;
const { BadRequestError, NotFoundError } = require('utils/errors');
const { generateUniqueSlug } = require('utils/slugGenerator');
const bcrypt = require('bcryptjs');

// User Management
exports.createUser = async (userData, creatorUser) => {
  const { name, email, password, phone, roleName, restaurantId } = userData;

  const existingUser = await models.User.findOne({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('Usuário já existe com este email');
  }

  const role = await models.Role.findOne({ where: { name: roleName } });
  if (!role) {
    throw new BadRequestError(`Função '${roleName}' não encontrada.`);
  }

  let finalRestaurantId = restaurantId;

  // If the creator is not a super_admin, the new user must be associated with the creator's restaurant
  if (creatorUser && creatorUser.role.name !== 'super_admin') {
    if (!creatorUser.restaurantId) {
      throw new BadRequestError('O usuário criador não está associado a um restaurante.');
    }
    finalRestaurantId = creatorUser.restaurantId;
  } else { // If creator is super_admin or no creatorUser (e.g., initial setup)
    if (!restaurantId) {
      throw new BadRequestError('ID do restaurante é obrigatório para todos os usuários criados por um super admin.');
    }
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new NotFoundError('Restaurante não encontrado.');
    }
    finalRestaurantId = restaurantId;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await models.User.create({
    name, email, passwordHash: hashedPassword, phone
  });

  // Add user-restaurant association
  await models.UserRestaurant.create({
    userId: user.id,
    restaurantId: finalRestaurantId,
    isOwner: false, // Not an owner by default
  });

  await models.UserRole.create({
    userId: user.id,
    roleId: role.id,
    restaurantId: finalRestaurantId,
  });

  return user;
};

exports.createRestaurantWithOwner = async (data) => {
  const { restaurantName, ownerName, ownerEmail, ownerPassword } = data;

  return sequelize.transaction(async (t) => {
    // 1. Check if user already exists
    const existingUser = await models.User.findOne({ where: { email: ownerEmail }, transaction: t });
    if (existingUser) {
      throw new BadRequestError('Um usuário com este email já existe.');
    }

    // 2. Get the 'owner' role
    const ownerRole = await models.Role.findOne({ where: { name: 'owner' }, transaction: t });
    if (!ownerRole) {
      throw new NotFoundError("A função de 'owner' não foi encontrada.");
    }

    // 3. Create the owner user
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    const owner = await models.User.create({
      name: ownerName,
      email: ownerEmail,
      passwordHash: hashedPassword,
      // restaurantId will be updated after restaurant is created
    }, { transaction: t });

    // 4. Create the restaurant
    const restaurant = await models.Restaurant.create({
      name: restaurantName,
      ownerId: owner.id,
      slug: await generateUniqueSlug(models.Restaurant, restaurantName),
      // Add other restaurant fields from `data` if necessary
      ...data,
    }, { transaction: t });

    // 5. Create the user-restaurant association
    await models.UserRestaurant.create({
      userId: owner.id,
      restaurantId: restaurant.id,
      isOwner: true, // Mark as owner
    }, { transaction: t });

    // 6. Create the user-role association
    await models.UserRole.create({
      userId: owner.id,
      roleId: ownerRole.id,
      restaurantId: restaurant.id,
    }, { transaction: t });

    return { restaurant, owner };
  });
};


exports.listUsers = async () => {
  const users = await models.User.findAll({
    attributes: ['id', 'name', 'email'], // Only direct attributes
    include: [{ model: models.Role, as: 'roles', attributes: ['name'] }], // Include the associated role
    order: [['name', 'ASC']]
  });
  return users;
};

exports.updateUser = async (userId, updateData) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('Usuário não encontrado');
  }

  if (updateData.roleName) {
    const role = await models.Role.findOne({ where: { name: updateData.roleName } });
    if (!role) {
      throw new BadRequestError(`Função '${updateData.roleName}' não encontrada.`);
    }
    updateData.roleId = role.id;
    delete updateData.roleName;
  }

  await user.update(updateData);
  return user;
};

// Restaurant Management
exports.createRestaurant = async (restaurantData) => {
  const { name } = restaurantData;
  let { ownerId } = restaurantData;

  if (!ownerId) {
    const superAdminRole = await models.Role.findOne({ where: { name: 'super_admin' } });
    if (!superAdminRole) {
      throw new BadRequestError('Função super_admin não encontrada.');
    }
    const superAdminUser = await models.User.findOne({ where: { roleId: superAdminRole.id } });
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

  // Update the owner's user record with the new restaurantId
  await models.User.update(
    { restaurantId: restaurant.id },
    { where: { id: ownerId } }
  );
  console.log('User after restaurantId update:', await models.User.findByPk(ownerId));

  return restaurant;
};

exports.listRestaurants = async () => {
  const restaurants = await models.Restaurant.findAll({
    include: [
      {
        model: models.UserRestaurant,
        as: 'users',
        where: { isOwner: true },
        required: false,
        include: [{
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }]
      }
    ],
    order: [['name', 'ASC']]
  });

  const formattedRestaurants = restaurants.map(r => {
      const restaurantJson = r.toJSON();
      if (restaurantJson.users && restaurantJson.users.length > 0) {
          restaurantJson.owner = restaurantJson.users[0].user;
      } else {
          restaurantJson.owner = null;
      }
      delete restaurantJson.users;
      return restaurantJson;
  });

  return formattedRestaurants;
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
  // 1. Fetch all top-level entities in parallel for better performance
  const [modules, submodules, features] = await Promise.all([
    models.Module.findAll({
      order: [['displayName', 'ASC']],
      raw: true, // Use raw: true for performance gain, returns plain JSON
    }),
    models.Submodule.findAll({
      order: [['displayName', 'ASC']],
      raw: true,
    }),
    models.Feature.findAll({
      order: [['description', 'ASC']],
      raw: true,
    }),
  ]);

  // 2. Create maps for efficient lookups (O(n) complexity)
  const featureMapBySubmoduleId = {};
  const featureMapByModuleId = {};
  features.forEach(feature => {
    if (feature.submoduleId) {
      if (!featureMapBySubmoduleId[feature.submoduleId]) {
        featureMapBySubmoduleId[feature.submoduleId] = [];
      }
      featureMapBySubmoduleId[feature.submoduleId].push(feature);
    } else if (feature.moduleId) { // Features directly under a module
      if (!featureMapByModuleId[feature.moduleId]) {
        featureMapByModuleId[feature.moduleId] = [];
      }
      featureMapByModuleId[feature.moduleId].push(feature);
    }
  });

  const submoduleMapByModuleId = {};
  submodules.forEach(submodule => {
    // Attach features to each submodule from the map
    submodule.features = featureMapBySubmoduleId[submodule.id] || [];
    if (!submoduleMapByModuleId[submodule.moduleId]) {
      submoduleMapByModuleId[submodule.moduleId] = [];
    }
    submoduleMapByModuleId[submodule.moduleId].push(submodule);
  });

  // 3. Assemble the final nested structure
  modules.forEach(module => {
    module.Submodules = submoduleMapByModuleId[module.id] || [];
    module.features = featureMapByModuleId[module.id] || [];
  });

  return modules;
};

exports.getRestaurantFeatures = async (restaurantId) => { // Renamed function
  const restaurant = await models.Restaurant.findByPk(restaurantId, {
    include: [{ model: models.Feature, as: 'features', attributes: ['id', 'name', 'description', 'path'] }] // Changed to Feature and its attributes
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  // Return only the feature IDs for consistency with frontend expectation
  return restaurant.features.map(feature => feature.id);
};

exports.updateRestaurantFeatures = async (restaurantId, enabledFeatureIds) => { // Renamed function and parameter
  const t = await sequelize.transaction();
  try {
    const restaurant = await models.Restaurant.findByPk(restaurantId, { transaction: t });
    if (!restaurant) {
      throw new NotFoundError('Restaurante não encontrado');
    }

    // Directly use the received enabledFeatureIds
    // const moduleIdsToSet = enabledFeatureIds; // This line is no longer needed

    // Set the features for the restaurant
    await restaurant.setFeatures(enabledFeatureIds, { transaction: t }); // Changed to setFeatures

    await t.commit();

    // Return the updated list of feature IDs for consistency
    return enabledFeatureIds; // Return enabledFeatureIds
  } catch (error) {
    if (t) await t.rollback();
    throw error;
  }
};
