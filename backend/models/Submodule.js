"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class Submodule extends Sequelize.Model {
    static associate(models) {
      Submodule.belongsTo(models.Module, {
        foreignKey: "module_id",
        as: "module",
      });
      Submodule.hasMany(models.Feature, {
        foreignKey: "submodule_id",
        as: "features",
      });
    }
  }

  Submodule.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      moduleId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "module_id",
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
      modelName: "Submodule",
      tableName: "submodules",
      timestamps: true,
      underscored: true,
    },
  );

  return Submodule;
};
