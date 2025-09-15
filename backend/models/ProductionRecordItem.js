"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductionRecordItem extends Model {
    static associate(models) {
      ProductionRecordItem.belongsTo(models.ProductionRecord, {
        foreignKey: "production_record_id",
        as: "productionRecord",
      });
      ProductionRecordItem.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  ProductionRecordItem.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      productionRecordId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "production_record_id",
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "product_id",
      },
      quantityProduced: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        field: "quantity_produced",
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
      modelName: "ProductionRecordItem",
      tableName: "production_record_items",
      timestamps: true,
      underscored: true,
    },
  );

  return ProductionRecordItem;
};
