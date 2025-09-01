'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CashRegisterCategory extends Model {
    static associate(models) {
      CashRegisterCategory.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      CashRegisterCategory.hasMany(models.CashRegisterMovement, {
        foreignKey: 'category_id',
        as: 'movements',
      });
    }
  }

  CashRegisterCategory.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'restaurant_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'CashRegisterCategory',
    tableName: 'cash_register_categories',
    timestamps: true,
    underscored: true,
  });

  return CashRegisterCategory;
};
