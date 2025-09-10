'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reward extends Model {
    static associate(models) {
      Reward.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer',
      });
      Reward.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      // Add association to Coupon
      Reward.hasMany(models.Coupon, {
        foreignKey: 'rewardId', // Use camelCase for foreignKey in model definition
        as: 'coupons',
      });
    }
  }

  Reward.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'customer_id',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRedeemed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_redeemed',
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
    modelName: 'Reward',
    tableName: 'rewards',
    timestamps: true,
    underscored: true,
  });

  return Reward;
};
