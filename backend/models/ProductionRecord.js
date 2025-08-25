'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
    user_id: { // User who performed the production
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    production_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ProductionRecord',
    tableName: 'production_records',
    timestamps: true,
  });

  return ProductionRecord;
};