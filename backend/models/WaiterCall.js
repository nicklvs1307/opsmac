"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class WaiterCall extends Sequelize.Model {
    static associate(models) {
      WaiterCall.belongsTo(models.Table, {
        foreignKey: "table_id",
        as: "table",
      });
      WaiterCall.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  WaiterCall.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      tableId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "table_id",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
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
      modelName: "WaiterCall",
      tableName: "waiter_calls",
      timestamps: true,
      underscored: true,
    },
  );

  return WaiterCall;
};
