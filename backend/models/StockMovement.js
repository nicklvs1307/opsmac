'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StockMovement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      StockMovement.belongsTo(models.Product, {
        foreignKey: 'stockableId',
        constraints: false,
        as: 'product',
      });
      StockMovement.belongsTo(models.Ingredient, {
        foreignKey: 'stockableId',
        constraints: false,
        as: 'ingredient',
      });
    }

    // Helper method to get the associated stockable item (Product or Ingredient)
    getStockable(options) {
      if (!this.stockableType) return Promise.resolve(null);
      const mixinMethodName = `get${this.stockableType}`;
      return this[mixinMethodName](options);
    }
  }

  StockMovement.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    stockableId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockableType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: { // 'in' for incoming, 'out' for outgoing
      type: DataTypes.ENUM('in', 'out'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    movementDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    description: { // e.g., 'Initial stock', 'Sale', 'Return', 'Adjustment'
      type: DataTypes.STRING,
      allowNull: true,
    },
    // You might add user_id who performed the movement, order_id, etc.
  }, {
    sequelize,
    modelName: 'StockMovement',
    tableName: 'stock_movements',
    indexes: [
      {
        fields: ['stockableId', 'stockableType'],
      },
    ],
    timestamps: true,
  });

  return StockMovement;
};