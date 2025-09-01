'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      AuditLog.belongsTo(models.User, {
        foreignKey: 'actor_user_id',
        as: 'actor',
      });
      AuditLog.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
    }
  }

  AuditLog.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    actorUserId: {
      type: DataTypes.UUID,
      field: 'actor_user_id',
    },
    restaurantId: {
      type: DataTypes.UUID,
      field: 'restaurant_id',
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    resource: {
      type: DataTypes.TEXT,
    },
    payload: {
      type: DataTypes.JSONB,
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
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
  });

  return AuditLog;
};
