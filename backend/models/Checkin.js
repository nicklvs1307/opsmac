const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Checkin = sequelize.define('Checkin', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    checkin_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    checkout_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
  }, {
    tableName: 'checkins',
    timestamps: true,
    underscored: true,
  });

  Checkin.associate = (models) => {
    Checkin.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer'
    });
    Checkin.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant'
    });
  };

  return Checkin;
};