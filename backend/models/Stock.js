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
        foreignKey: 'stockableId',
        constraints: false,
        as: 'product',
      });
      Stock.belongsTo(models.Ingredient, {
        foreignKey: 'stockableId',
        constraints: false,
        as: 'ingredient',
      });
      Stock.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant',
      });
    }

    // Helper method to get the associated stockable item (Product or Ingredient)
    getStockable(options) {
      if (!this.stockableType) return Promise.resolve(null);
      const mixinMethodName = `get${this.stockableType}`;
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
    stockableId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockableType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    restaurantId: {
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
        fields: ['stockableId', 'stockableType'],
      },
    ],
    timestamps: true,
  });

  return Stock;
};