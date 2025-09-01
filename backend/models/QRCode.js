'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QRCode extends Model {
    static associate(models) {
      QRCode.belongsTo(models.Table, {
        foreignKey: 'table_id',
        as: 'table',
      });
      QRCode.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
    }
  }

  QRCode.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    tableId: {
      type: DataTypes.UUID,
      field: 'table_id',
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'restaurant_id',
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
    modelName: 'QRCode',
    tableName: 'qrcodes',
    timestamps: true,
    underscored: true,
  });

  return QRCode;
};
