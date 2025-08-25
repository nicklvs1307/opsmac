'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CashRegisterSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CashRegisterSession.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant',
      });
      CashRegisterSession.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }

  CashRegisterSession.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    openingCash: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    openingObservations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    openingTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    closingCash: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    closingObservations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    closingTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('open', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
  }, {
    sequelize,
    modelName: 'CashRegisterSession',
    tableName: 'cash_register_sessions',
    timestamps: true,
  });

  return CashRegisterSession;
};
