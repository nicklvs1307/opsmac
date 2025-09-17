"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class Role extends Sequelize.Model {
    static associate(models) {
      Role.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      Role.hasMany(models.RolePermission, {
        foreignKey: "role_id",
        as: "permissions",
      });
      Role.hasMany(models.UserRole, {
        foreignKey: "role_id",
        as: "userRoles",
      });

      Role.belongsToMany(models.User, {
        through: models.UserRole,
        foreignKey: "role_id",
        otherKey: "user_id",
        as: "users",
      });
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      restaurantId: {
        type: DataTypes.UUID,
        field: "restaurant_id",
      },
      key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_system",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "roles",
      timestamps: true,
      underscored: true,
    },
  );

  return Role;
};
