"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class StockCount extends Model {
    static associate(models) {
      StockCount.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      StockCount.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      StockCount.hasMany(models.StockCountItem, {
        foreignKey: "stock_count_id",
        as: "items",
      });
    }
  }

  StockCount.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      referenceDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "reference_date",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      userId: {
        type: DataTypes.UUID,
        field: "user_id",
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
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
      modelName: "StockCount",
      tableName: "stock_counts",
      timestamps: true,
      underscored: true,
    },
  );

  return StockCount;
};
