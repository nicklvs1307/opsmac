"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, {
        foreignKey: "role_id",
        as: "role",
      });
      RolePermission.belongsTo(models.Feature, {
        foreignKey: "feature_id",
        as: "feature",
      });
      RolePermission.belongsTo(models.Action, {
        foreignKey: "action_id",
        as: "action",
      });
    }
  }

  RolePermission.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "role_id",
      },
      featureId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "feature_id",
      },
      actionId: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        field: "action_id",
      },
      allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      sequelize,
      modelName: "RolePermission",
      tableName: "role_permissions",
      timestamps: true,
      underscored: true,
    },
  );

  return RolePermission;
};
