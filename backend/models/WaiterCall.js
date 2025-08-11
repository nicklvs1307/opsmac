const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WaiterCall = sequelize.define('WaiterCall', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    table_session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'table_sessions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    call_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'acknowledged', 'resolved'),
      defaultValue: 'pending',
      allowNull: false
    },
    type: { // e.g., 'waiter', 'bill', 'other'
      type: DataTypes.STRING,
      allowNull: true
    },
    description: { // Optional: for 'other' type or additional details
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'waiter_calls'
  });

  WaiterCall.associate = (models) => {
    WaiterCall.belongsTo(models.TableSession, {
      foreignKey: 'table_session_id',
      as: 'session'
    });
  };

  return WaiterCall;
};