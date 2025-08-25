'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class WaiterCall extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      WaiterCall.belongsTo(models.TableSession, {
        foreignKey: 'table_session_id',
        as: 'session',
      });
    }
  }

  WaiterCall.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    table_session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'table_sessions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    call_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('pending', 'acknowledged', 'resolved'),
      defaultValue: 'pending',
      allowNull: false,
    },
    type: { // e.g., 'waiter', 'bill', 'other'
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: { // Optional: for 'other' type or additional details
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'WaiterCall',
    tableName: 'waiter_calls',
    timestamps: true,
  });

  return WaiterCall;
};