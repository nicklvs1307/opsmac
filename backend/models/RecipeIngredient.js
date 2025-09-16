"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class RecipeIngredient extends Sequelize.Model {
    static associate(models) {
      RecipeIngredient.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
      RecipeIngredient.belongsTo(models.Ingredient, {
        foreignKey: "ingredient_id",
        as: "ingredient",
      });
    }
  }

  RecipeIngredient.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "product_id",
      },
      ingredientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "ingredient_id",
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
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
      modelName: "RecipeIngredient",
      tableName: "recipe_ingredients",
      timestamps: true,
      underscored: true,
    },
  );

  return RecipeIngredient;
};