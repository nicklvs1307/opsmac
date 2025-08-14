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
    table_number: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'The table number provided by the customer during check-in.',
    },
    coupon_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'coupons', // refers to the 'coupons' table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    Checkin.belongsTo(models.Coupon, {
      foreignKey: 'coupon_id',
      as: 'coupon'
    });
  };

  return Checkin;
};