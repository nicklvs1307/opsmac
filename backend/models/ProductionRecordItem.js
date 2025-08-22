'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProductionRecordItem extends Model {
    static associate(models) {
      ProductionRecordItem.belongsTo(models.ProductionRecord, {
        foreignKey: 'production_record_id',
        as: 'productionRecord',
      });
      // Polymorphic association to Product or Ingredient
      ProductionRecordItem.belongsTo(models.Product, {
        foreignKey: 'stockable_id',
        constraints: false,
        as: 'product',
      });
      ProductionRecordItem.belongsTo(models.Ingredient, {
        foreignKey: 'stockable_id',
        constraints: false,
        as: 'ingredient',
      });
    }

    // Helper method to get the associated stockable item
    getStockable(options) {
      if (!this.stockable_type) return Promise.resolve(null);
      const mixinMethodName = `get${this.stockable_type}`;
      return this[mixinMethodName](options);
    }
  }

  ProductionRecordItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    production_record_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'production_records',
        key: 'id',
      },
    },
    stockable_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockable_type: {
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
    underscored: true,
    indexes: [
      {
        fields: ['production_record_id', 'stockable_id', 'stockable_type'],
      },
    ],
  });

  return ProductionRecordItem;
};