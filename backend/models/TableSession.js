"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TableSession extends Model {
    static associate(models) {
      TableSession.belongsTo(models.Table, {
        foreignKey: "table_id",
        as: "table",
      });
      TableSession.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
      });
      TableSession.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  TableSession.init(
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
      customerId: {
        type: DataTypes.UUID,
        field: "customer_id",
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "start_time",
      },
      endTime: {
        type: DataTypes.DATE,
        field: "end_time",
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
      modelName: "TableSession",
      tableName: "table_sessions",
      timestamps: true,
      underscored: true,
    },
  );

  return TableSession;
};
