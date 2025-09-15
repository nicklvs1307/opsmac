"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    static associate(models) {
      UserRole.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      UserRole.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      UserRole.belongsTo(models.Role, { foreignKey: "role_id", as: "role" });
    }
  }

  UserRole.init(
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        field: "user_id",
      },
      restaurantId: {
        type: DataTypes.UUID,
        primaryKey: true,
        field: "restaurant_id",
      },
      roleId: {
        type: DataTypes.UUID,
        primaryKey: true,
        field: "role_id",
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
      modelName: "UserRole",
      tableName: "user_roles",
      timestamps: true,
      underscored: true,
    },
  );

  return UserRole;
};
