"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PrintedLabel extends Model {
    static associate(models) {
      PrintedLabel.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      PrintedLabel.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      // Polymorphic association to Stock (stockable_id, stockable_type) is handled in service layer
    }
  }

  PrintedLabel.init(
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
      printDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "print_date",
      },
      quantity: {
        type: DataTypes.INTEGER,
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
      modelName: "PrintedLabel",
      tableName: "printed_labels",
      timestamps: true,
      underscored: true,
    },
  );

  return PrintedLabel;
};
