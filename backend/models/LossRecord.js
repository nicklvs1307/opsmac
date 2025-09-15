"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LossRecord extends Model {
    static associate(models) {
      LossRecord.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      LossRecord.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      // Polymorphic association to Stock (stockable_id, stockable_type) is handled in service layer
    }
  }

  LossRecord.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      stockableId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "stockable_id",
      },
      stockableType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "stockable_type",
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "LossRecord",
      tableName: "loss_records",
      timestamps: true,
      underscored: true,
    },
  );

  return LossRecord;
};
