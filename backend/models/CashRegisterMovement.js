'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CashRegisterMovement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CashRegisterMovement.belongsTo(models.CashRegisterSession, {
        foreignKey: 'session_id',
        as: 'session',
      });
      CashRegisterMovement.belongsTo(models.CashRegisterCategory, {
        foreignKey: 'category_id',
        as: 'category',
      });
      CashRegisterMovement.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  }

  CashRegisterMovement.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    session_id: { // Link to the cash register session
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cash_register_sessions',
        key: 'id',
      },
    },
    type: { // 'withdrawal' or 'reinforcement'
      type: DataTypes.ENUM('withdrawal', 'reinforcement'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category_id: { // For withdrawals, optional for reinforcement
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'cash_register_categories',
        key: 'id',
      },
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: { // User who performed the movement
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'CashRegisterMovement',
    tableName: 'cash_register_movements',
    underscored: true,
    timestamps: true,
  });

  return CashRegisterMovement;
};
