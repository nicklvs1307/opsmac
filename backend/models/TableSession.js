const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TableSession = sequelize.define('TableSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    table_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tables',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'bill_requested', 'waiter_called'),
      defaultValue: 'active',
      allowNull: false
    },
    customer_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'table_sessions'
  });

  TableSession.associate = (models) => {
    TableSession.belongsTo(models.Table, {
      foreignKey: 'table_id',
      as: 'table'
    });
    TableSession.hasMany(models.WaiterCall, {
      foreignKey: 'table_session_id',
      as: 'waiterCalls'
    });
  };

  return TableSession;
};