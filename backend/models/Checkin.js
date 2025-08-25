'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Checkin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Checkin.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        as: 'customer',
      });
      Checkin.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant',
      });
      Checkin.belongsTo(models.Coupon, {
        foreignKey: 'couponId',
        as: 'coupon',
      });
    }
  }

  Checkin.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    checkinTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    tableNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'The table number provided by the customer during check-in.',
    },
    couponId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'coupons', // refers to the 'coupons' table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    checkoutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Checkin',
    tableName: 'checkins',
    timestamps: true,
  });

  return Checkin;
};