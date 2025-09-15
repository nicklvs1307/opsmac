"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FinancialTransaction extends Model {
    static associate(models) {
      FinancialTransaction.belongsTo(models.FinancialCategory, {
        foreignKey: "category_id",
        as: "category",
      });
      FinancialTransaction.belongsTo(models.PaymentMethod, {
        foreignKey: "payment_method_id",
        as: "paymentMethod",
      });
      FinancialTransaction.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      FinancialTransaction.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  FinancialTransaction.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.UUID,
        field: "category_id",
      },
      paymentMethodId: {
        type: DataTypes.UUID,
        field: "payment_method_id",
      },
      transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "transaction_date",
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
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
      modelName: "FinancialTransaction",
      tableName: "financial_transactions",
      timestamps: true,
      underscored: true,
    },
  );

  return FinancialTransaction;
};
