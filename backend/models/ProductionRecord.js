'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductionRecord extends Model {
    static associate(models) {
      ProductionRecord.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      ProductionRecord.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      ProductionRecord.hasMany(models.ProductionRecordItem, {
        foreignKey: 'production_record_id',
        as: 'items',
      });
    }
  }

  ProductionRecord.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
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
    modelName: 'ProductionRecord',
    tableName: 'production_records',
    timestamps: true,
    underscored: true,
  });

  return ProductionRecord;
};
