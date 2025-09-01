'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPermissionOverride extends Model {
    static associate(models) {
      UserPermissionOverride.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      UserPermissionOverride.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
      UserPermissionOverride.belongsTo(models.Feature, { foreignKey: 'feature_id', as: 'feature' });
      UserPermissionOverride.belongsTo(models.Action, { foreignKey: 'action_id', as: 'action' });
    }
  }

  UserPermissionOverride.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'restaurant_id',
    },
    featureId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'feature_id',
    },
    actionId: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      field: 'action_id',
    },
    allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    modelName: 'UserPermissionOverride',
    tableName: 'user_permission_overrides',
    timestamps: true,
    underscored: true,
  });

  return UserPermissionOverride;
};
