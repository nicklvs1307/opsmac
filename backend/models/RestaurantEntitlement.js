'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RestaurantEntitlement extends Model {
    static associate(models) {
      RestaurantEntitlement.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      // Note: Polymorphic association to Module/Submodule/Feature cannot be defined here
      // It must be handled in the service layer.
    }
  }

  RestaurantEntitlement.init({
    restaurantId: {
      type: DataTypes.UUID,
      primaryKey: true,
      field: 'restaurant_id',
    },
    entityType: {
      type: DataTypes.ENUM('module', 'submodule', 'feature'),
      primaryKey: true,
      field: 'entity_type',
    },
    entityId: {
      type: DataTypes.UUID,
      primaryKey: true,
      field: 'entity_id',
    },
    status: {
      type: DataTypes.ENUM('active', 'locked', 'hidden', 'trial'),
      allowNull: false,
    },
    source: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
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
    modelName: 'RestaurantEntitlement',
    tableName: 'restaurant_entitlements',
    timestamps: true,
    underscored: true,
  });

  return RestaurantEntitlement;
};
