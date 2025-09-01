'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Table extends Model {
    static associate(models) {
      Table.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      Table.hasMany(models.QRCode, {
        foreignKey: 'table_id',
        as: 'qrcodes',
      });
      Table.hasMany(models.TableSession, {
        foreignKey: 'table_id',
        as: 'sessions',
      });
      Table.hasMany(models.Order, {
        foreignKey: 'table_id',
        as: 'orders',
      });
      Table.hasMany(models.WaiterCall, {
        foreignKey: 'table_id',
        as: 'waiterCalls',
      });
    }
  }

  Table.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'restaurant_id',
    },
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'table_number',
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
    modelName: 'Table',
    tableName: 'tables',
    timestamps: true,
    underscored: true,
  });

  return Table;
};
