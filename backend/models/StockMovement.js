"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class StockMovement extends Sequelize.Model {
    static associate(models) {
      StockMovement.belongsTo(models.Stock, {
        foreignKey: "stock_id",
        as: "stock",
      });
      StockMovement.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  StockMovement.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      stockId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "stock_id",
      },
      quantityChange: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        field: "quantity_change",
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
      },
      userId: {
        type: DataTypes.UUID,
        field: "user_id",
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
      modelName: "StockMovement",
      tableName: "stock_movements",
      timestamps: true,
      underscored: true,
    },
  );

  return StockMovement;
};