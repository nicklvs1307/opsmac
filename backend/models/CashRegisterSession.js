const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CashRegisterSession = sequelize.define('CashRegisterSession', {
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    opening_cash: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    opening_observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    opening_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    closing_cash: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    closing_observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    closing_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('open', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
  }, {
    freezeTableName: true,
    tableName: 'cash_register_sessions',
  });

  CashRegisterSession.associate = (models) => {
    CashRegisterSession.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant',
    });
    CashRegisterSession.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return CashRegisterSession;
};
