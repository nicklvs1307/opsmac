"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class Stock extends Sequelize.Model {
    static associate(models) {
      Stock.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      Stock.hasMany(models.StockMovement, {
        foreignKey: "stock_id",
        as: "movements",
      });
      // Polymorphic association defined in Product and Ingredient models
    }
  }

  Stock.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0,
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
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
      },
      labelFormat: {
        type: DataTypes.STRING,
        field: "label_format",
      },
      labelFields: {
        type: DataTypes.JSONB,
        field: "label_fields",
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
      modelName: "Stock",
      tableName: "stocks",
      timestamps: true,
      underscored: true,
    },
  );

  return Stock;
};
