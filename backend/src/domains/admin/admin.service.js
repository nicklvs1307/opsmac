import { BadRequestError, NotFoundError } from "../../utils/errors.js";
import { generateUniqueSlug } from "../../utils/slugGenerator.js";
import bcrypt from "bcryptjs";
import auditService from "../../services/auditService.js";

export default (db) => {
  const models = db;
  const sequelize = db.sequelize;

  const createUser = async (actorUser, userData) => {
    const { name, email, password, phone, roleName, restaurantId } = userData;

    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError("Usuário já existe com este email");
    }

    const role = await models.Role.findOne({ where: { name: roleName } });
    if (!role) {
      throw new BadRequestError(`Função '${roleName}' não encontrada.`);
    }

    let finalRestaurantId = restaurantId;

    if (actorUser && actorUser.role.name !== "super_admin") {
      if (!actorUser.restaurantId) {
        throw new BadRequestError(
          "O usuário criador não está associado a um restaurante.",
        );
      }
      finalRestaurantId = actorUser.restaurantId;
    } else {
      if (!restaurantId) {
        throw new BadRequestError(
          "ID do restaurante é obrigatório para todos os usuários criados por um super admin.",
        );
      }
      const restaurant = await models.Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw new NotFoundError("Restaurante não encontrado.");
      }
      finalRestaurantId = restaurantId;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await models.User.create({
      name,
      email,
      passwordHash: hashedPassword,
      phone,
    });

    await models.UserRestaurant.create({
      userId: user.id,
      restaurantId: finalRestaurantId,
      isOwner: false,
    });

    await models.UserRole.create({
      userId: user.id,
      roleId: role.id,
      restaurantId: finalRestaurantId,
    });

    await auditService.log(
      actorUser,
      finalRestaurantId,
      "USER_CREATED",
      `User:${user.id}`,
      { name, email, phone, roleName, restaurantId: finalRestaurantId },
    );

    return user;
  };

  const createRestaurantWithOwner = async (actorUser, data) => {
    const { restaurantName, ownerName, ownerEmail, ownerPassword } = data;

    return sequelize.transaction(async (t) => {
      const existingUser = await models.User.findOne({
        where: { email: ownerEmail },
        transaction: t,
      });
      if (existingUser) {
        throw new BadRequestError("Um usuário com este email já existe.");
      }

      const ownerRole = await models.Role.findOne({
        where: { name: "owner" },
        transaction: t,
      });
      if (!ownerRole) {
        throw new NotFoundError("A função de 'owner' não foi encontrada.");
      }

      const hashedPassword = await bcrypt.hash(ownerPassword, 10);
      const owner = await models.User.create(
        {
          name: ownerName,
          email: ownerEmail,
          passwordHash: hashedPassword,
        },
        { transaction: t },
      );

      const restaurant = await models.Restaurant.create(
        {
          name: restaurantName,
          ownerId: owner.id,
          slug: await generateUniqueSlug(models.Restaurant, restaurantName),
          ...data,
        },
        { transaction: t },
      );

      await models.UserRestaurant.create(
        {
          userId: owner.id,
          restaurantId: restaurant.id,
          isOwner: true,
        },
        { transaction: t },
      );

      await models.UserRole.create(
        {
          userId: owner.id,
          roleId: ownerRole.id,
          restaurantId: restaurant.id,
        },
        { transaction: t },
      );

      await auditService.log(
        actorUser,
        restaurant.id,
        "RESTAURANT_CREATED_WITH_OWNER",
        `Restaurant:${restaurant.id}`,
        { restaurantName, ownerEmail },
      );

      return { restaurant, owner };
    });
  };

  const listUsers = async () => {
    return models.User.findAll({
      attributes: ["id", "name", "email", "phone"],
      include: [
        { model: models.Role, as: "roles", attributes: ["id", "name"] },
      ],
      order: [["name", "ASC"]],
    });
  };

  const updateUser = async (actorUser, userId, updateData) => {
    const user = await models.User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    const oldUserData = { ...user.toJSON() }; // Capture old data for audit

    if (updateData.roleName) {
      const role = await models.Role.findOne({
        where: { name: updateData.roleName },
      });
      if (!role) {
        throw new BadRequestError(
          `Função '${updateData.roleName}' não encontrada.`,
        );
      }
      // Assuming role update logic is handled elsewhere or needs to be added here
      // For now, just remove roleName from updateData if it's not a direct user field
      delete updateData.roleName;
    }

    await user.update(updateData);

    await auditService.log(
      actorUser,
      null, // User update might not be tied to a specific restaurant context directly here
      "USER_UPDATED",
      `User:${userId}`,
      { oldData: oldUserData, newData: updateData },
    );

    return user;
  };

  const createRestaurant = async (actorUser, restaurantData) => {
    const { name } = restaurantData;
    let { ownerId } = restaurantData;

    if (!ownerId) {
      const superAdminRole = await models.Role.findOne({
        where: { name: "super_admin" },
      });
      if (!superAdminRole) {
        throw new BadRequestError("Função super_admin não encontrada.");
      }
      const superAdminUser = await models.User.findOne({
        where: { roleId: superAdminRole.id },
      });
      if (superAdminUser) {
        ownerId = superAdminUser.id;
      } else {
        throw new BadRequestError(
          "Proprietário não encontrado e nenhum super_admin disponível para atribuição.",
        );
      }
    }

    const owner = await models.User.findByPk(ownerId);
    if (!owner) {
      throw new BadRequestError("Proprietário não encontrado");
    }

    const restaurant = await models.Restaurant.create({
      ...restaurantData,
      ownerId,
      slug: await generateUniqueSlug(models.Restaurant, name),
    });

    await models.User.update(
      { restaurantId: restaurant.id },
      { where: { id: ownerId } },
    );

    await auditService.log(
      actorUser,
      restaurant.id,
      "RESTAURANT_CREATED",
      `Restaurant:${restaurant.id}`,
      { name, ownerId },
    );

    return restaurant;
  };

  const listRestaurants = async () => {
    const restaurants = await models.Restaurant.findAll({
      include: [
        {
          model: models.UserRestaurant,
          as: "users",
          where: { isOwner: true },
          required: false,
          include: [
            {
              model: models.User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      order: [["name", "ASC"]],
    });

    return restaurants.map((r) => {
      const restaurantJson = r.toJSON();
      restaurantJson.owner = restaurantJson.users?.[0]?.user || null;
      delete restaurantJson.users;
      return restaurantJson;
    });
  };

  const getRestaurantById = async (restaurantId) => {
    return models.Restaurant.findByPk(restaurantId);
  };

  const updateRestaurant = async (actorUser, restaurantId, updateData) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado");
    }

    const oldRestaurantData = { ...restaurant.toJSON() }; // Capture old data for audit

    if (updateData.ownerId) {
      const newOwner = await models.User.findByPk(updateData.ownerId);
      if (!newOwner) {
        throw new BadRequestError("Novo proprietário não encontrado");
      }
    }

    await restaurant.update(updateData);

    await auditService.log(
      actorUser,
      restaurantId,
      "RESTAURANT_UPDATED",
      `Restaurant:${restaurantId}`,
      { oldData: oldRestaurantData, newData: updateData },
    );

    return restaurant;
  };

  const listModules = async () => {
    const [modules, submodules, features] = await Promise.all([
      models.Module.findAll({ order: [["displayName", "ASC"]], raw: true }),
      models.Submodule.findAll({ order: [["displayName", "ASC"]], raw: true }),
      models.Feature.findAll({ order: [["description", "ASC"]], raw: true }),
    ]);

    const featureMapBySubmoduleId = features.reduce((acc, feature) => {
      if (feature.submoduleId) {
        (acc[feature.submoduleId] = acc[feature.submoduleId] || []).push(
          feature,
        );
      }
      return acc;
    }, {});

    const featureMapByModuleId = features.reduce((acc, feature) => {
      if (feature.moduleId && !feature.submoduleId) {
        (acc[feature.moduleId] = acc[feature.moduleId] || []).push(feature);
      }
      return acc;
    }, {});

    const submoduleMapByModuleId = submodules.reduce((acc, submodule) => {
      submodule.features = featureMapBySubmoduleId[submodule.id] || [];
      (acc[submodule.moduleId] = acc[submodule.moduleId] || []).push(submodule);
      return acc;
    }, {});

    modules.forEach((module) => {
      module.Submodules = submoduleMapByModuleId[module.id] || [];
      module.features = featureMapByModuleId[module.id] || [];
    });

    return modules;
  };

  const getRestaurantFeatures = async (restaurantId) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId, {
      include: [
        {
          model: models.Feature,
          as: "features",
          attributes: ["id", "name", "description", "path"],
        },
      ],
    });

    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado");
    }
    return restaurant.features.map((feature) => feature.id);
  };

  const updateRestaurantFeatures = async (restaurantId, enabledFeatureIds) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado");
    }

    await restaurant.setFeatures(enabledFeatureIds);
    return enabledFeatureIds;
  };

  const deleteRestaurant = async (actorUser, restaurantId) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }

    await restaurant.destroy();

    await auditService.log(
      actorUser,
      restaurantId,
      "RESTAURANT_DELETED",
      `Restaurant:${restaurantId}`,
      { restaurantName: restaurant.name },
    );
  };

  const deleteUser = async (actorUser, userId) => {
    const user = await models.User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    await user.destroy();

    await auditService.log(
      actorUser,
      null, // User deletion might not be tied to a specific restaurant context directly here
      "USER_DELETED",
      `User:${userId}`,
      { userName: user.name, userEmail: user.email },
    );
  };

  return {
    createUser,
    createRestaurantWithOwner,
    listUsers,
    updateUser,
    createRestaurant,
    listRestaurants,
    getRestaurantById,
    updateRestaurant,
    listModules,
    getRestaurantFeatures,
    updateRestaurantFeatures,
    deleteRestaurant,
    deleteUser,
  };
};
