'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Stock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Stock.belongsTo(models.Product, {
        foreignKey: 'stockable_id',
        constraints: false,
        as: 'product',
      });
      Stock.belongsTo(models.Ingredient, {
        foreignKey: 'stockable_id',
        constraints: false,
        as: 'ingredient',
      });
      Stock.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
    }

    // Helper method to get the associated stockable item (Product or Ingredient)
    getStockable(options) {
      if (!this.stockable_type) return Promise.resolve(null);
      const mixinMethodName = `get${this.stockable_type}`;
      return this[mixinMethodName](options);
    }
  }

  Stock.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stockable_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockable_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'stocks',
    indexes: [
      {
        unique: true,
        fields: ['stockable_id', 'stockable_type'],
      },
    ],
    underscored: true,
    timestamps: true,
  });

  return Stock;
};