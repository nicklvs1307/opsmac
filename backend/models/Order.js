"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class Order extends Sequelize.Model {
    static associate(models) {
      Order.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
      });
      Order.belongsTo(models.Table, {
        foreignKey: "table_id",
        as: "table",
      });
      Order.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      customerId: {
        type: DataTypes.UUID,
        field: "customer_id",
      },
      tableId: {
        type: DataTypes.UUID,
        field: "table_id",
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      items: {
        type: DataTypes.JSONB,
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
      modelName: "Order",
      tableName: "orders",
      timestamps: true,
      underscored: true,
    },
  );

  return Order;
};