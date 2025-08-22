'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StockCount extends Model {
    static associate(models) {
      StockCount.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      StockCount.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      StockCount.hasMany(models.StockCountItem, {
        foreignKey: 'stock_count_id',
        as: 'items',
      });
    }
  }

  StockCount.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    user_id: { // User who performed the count
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    count_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed'),
      defaultValue: 'in_progress',
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'StockCount',
    tableName: 'stock_counts',
    timestamps: true,
    underscored: true,
  });

  return StockCount;
};