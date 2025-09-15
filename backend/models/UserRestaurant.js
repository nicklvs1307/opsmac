"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserRestaurant extends Model {
    static associate(models) {
      UserRestaurant.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      UserRestaurant.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  UserRestaurant.init(
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
      isOwner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_owner",
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
      modelName: "UserRestaurant",
      tableName: "user_restaurants",
      timestamps: true,
      underscored: true,
    },
  );

  return UserRestaurant;
};
