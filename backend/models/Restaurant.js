"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      Restaurant.hasMany(models.UserRestaurant, {
        foreignKey: "restaurant_id",
        as: "users",
      });
      // Associations for permissions
      Restaurant.hasMany(models.Role, {
        foreignKey: "restaurant_id",
        as: "roles",
      });
      Restaurant.hasMany(models.RestaurantEntitlement, {
        foreignKey: "restaurant_id",
        as: "entitlements",
      });
      Restaurant.hasMany(models.AuditLog, {
        foreignKey: "restaurant_id",
        as: "auditLogs",
      });
    }
  }

  Restaurant.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(150),
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      zipCode: {
        type: DataTypes.STRING(20),
        field: "zipCode",
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      email: {
        type: DataTypes.STRING(150),
      },
      website: {
        type: DataTypes.STRING(255),
      },
      logo: {
        type: DataTypes.STRING(500),
      },
      planKey: {
        type: DataTypes.TEXT,
        field: "plan_key",
      },
      status: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "active",
      },
      permVersion: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 1,
        field: "perm_version",
      },
      settings: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "createdAt",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updatedAt",
      },
    },
    {
      sequelize,
      modelName: "Restaurant",
      tableName: "restaurants",
      timestamps: true,
      underscored: true,
    },
  );

  return Restaurant;
};
