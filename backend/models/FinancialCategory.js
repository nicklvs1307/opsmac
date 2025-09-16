"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class FinancialCategory extends Sequelize.Model {
    static associate(models) {
      FinancialCategory.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      FinancialCategory.hasMany(models.FinancialTransaction, {
        foreignKey: "category_id",
        as: "financialTransactions",
      });
    }
  }

  FinancialCategory.init(
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
      type: {
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
      modelName: "FinancialCategory",
      tableName: "financial_categories",
      timestamps: true,
      underscored: true,
    },
  );

  return FinancialCategory;
};