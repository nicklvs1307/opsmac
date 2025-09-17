"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class StockCountItem extends Sequelize.Model {
    static associate(models) {
      StockCountItem.belongsTo(models.StockCount, {
        foreignKey: "stock_count_id",
        as: "stockCount",
      });
      // Polymorphic association to Stock (stockable_id, stockable_type) is handled in service layer
    }
  }

  StockCountItem.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      stockCountId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "stock_count_id",
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
      countedQuantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        field: "counted_quantity",
      },
      systemQuantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        field: "system_quantity",
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
      modelName: "StockCountItem",
      tableName: "stock_count_items",
      timestamps: true,
      underscored: true,
    },
  );

  return StockCountItem;
};
