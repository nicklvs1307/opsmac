"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class NpsCriterion extends Sequelize.Model {
    static associate(models) {
      NpsCriterion.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  NpsCriterion.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
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
      modelName: "NpsCriterion",
      tableName: "nps_criterions",
      timestamps: true,
      underscored: true,
    },
  );

  return NpsCriterion;
};
