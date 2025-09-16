"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class Ingredient extends Sequelize.Model {
    static associate(models) {
      Ingredient.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      Ingredient.belongsTo(models.Supplier, {
        foreignKey: "supplier_id",
        as: "supplier",
      });
      Ingredient.hasMany(models.RecipeIngredient, {
        foreignKey: "ingredient_id",
        as: "recipeIngredients",
      });
      Ingredient.hasOne(models.Stock, {
        foreignKey: "stockable_id",
        constraints: false,
        scope: {
          stockable_type: "ingredient",
        },
        as: "stock",
      });
    }
  }

  Ingredient.init(
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
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
      },
      supplierId: {
        type: DataTypes.UUID,
        field: "supplier_id",
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
      modelName: "Ingredient",
      tableName: "ingredients",
      timestamps: true,
      underscored: true,
    },
  );

  return Ingredient;
};