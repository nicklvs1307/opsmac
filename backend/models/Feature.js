"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class Feature extends Sequelize.Model {
    static associate(models) {
      Feature.belongsTo(models.Submodule, {
        foreignKey: "submodule_id",
        as: "submodule",
      });
      Feature.hasMany(models.RolePermission, {
        foreignKey: "feature_id",
        as: "rolePermissions",
      });
      Feature.hasMany(models.UserPermissionOverride, {
        foreignKey: "feature_id",
        as: "userOverrides",
      });
    }
  }

  Feature.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      submoduleId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "submodule_id",
      },
      key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "sort_order",
      },
      flags: {
        type: DataTypes.JSONB,
        defaultValue: {},
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
      modelName: "Feature",
      tableName: "features",
      timestamps: true,
      underscored: true,
    },
  );

  return Feature;
};
