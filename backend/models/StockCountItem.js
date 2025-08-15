'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StockCountItem extends Model {
    static associate(models) {
      StockCountItem.belongsTo(models.StockCount, {
        foreignKey: 'stock_count_id',
        as: 'stockCount'
      });
      // Polymorphic association to Product or Ingredient
      StockCountItem.belongsTo(models.Product, {
        foreignKey: 'stockable_id',
        constraints: false,
        as: 'product'
      });
      StockCountItem.belongsTo(models.Ingredient, {
        foreignKey: 'stockable_id',
        constraints: false,
        as: 'ingredient'
      });
    }

    // Helper method to get the associated stockable item
    getStockable(options) {
      if (!this.stockable_type) return Promise.resolve(null);
      const mixinMethodName = `get${this.stockable_type}`;
      return this[mixinMethodName](options);
    }
  }

  StockCountItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    stock_count_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stock_counts',
        key: 'id'
      }
    },
    stockable_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    stockable_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    system_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    counted_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true // Starts as null until user inputs it
    },
    discrepancy: {
        type: DataTypes.INTEGER,
        allowNull: true // Can be calculated when counted_quantity is set
    }
  }, {
    sequelize,
    modelName: 'StockCountItem',
    tableName: 'stock_count_items',
    timestamps: true,
    indexes: [
        {
          unique: true,
          fields: ['stock_count_id', 'stockable_id', 'stockable_type']
        }
    ]
  });

  return StockCountItem;
};