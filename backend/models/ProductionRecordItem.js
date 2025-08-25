'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProductionRecordItem extends Model {
    static associate(models) {
      ProductionRecordItem.belongsTo(models.ProductionRecord, {
        foreignKey: 'productionRecordId',
        as: 'productionRecord',
      });
      // Polymorphic association to Product or Ingredient
      ProductionRecordItem.belongsTo(models.Product, {
        foreignKey: 'stockableId',
        constraints: false,
        as: 'product',
      });
      ProductionRecordItem.belongsTo(models.Ingredient, {
        foreignKey: 'stockableId',
        constraints: false,
        as: 'ingredient',
      });
    }

    // Helper method to get the associated stockable item
    getStockable(options) {
      if (!this.stockableType) return Promise.resolve(null);
      const mixinMethodName = `get${this.stockableType}`;
      return this[mixinMethodName](options);
    }
  }

  ProductionRecordItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productionRecordId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'production_records',
        key: 'id',
      },
    },
    stockableId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockableType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('input', 'output'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ProductionRecordItem',
    tableName: 'production_record_items',
    timestamps: true,
    indexes: [
      {
        fields: ['productionRecordId', 'stockableId', 'stockableType'],
      },
    ],
  });

  return ProductionRecordItem;
};