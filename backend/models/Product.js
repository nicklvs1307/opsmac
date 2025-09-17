"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class Product extends Sequelize.Model {
    static associate(models) {
      Product.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      Product.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });
      Product.hasOne(models.TechnicalSpecification, {
        foreignKey: "product_id",
        as: "technicalSpecification",
      });
      Product.hasMany(models.RecipeIngredient, {
        foreignKey: "product_id",
        as: "recipeIngredients",
      });
      Product.hasMany(models.ProductionRecordItem, {
        foreignKey: "product_id",
        as: "productionRecordItems",
      });
      Product.hasOne(models.Stock, {
        foreignKey: "stockable_id",
        constraints: false,
        scope: {
          stockable_type: "product",
        },
        as: "stock",
      });
    }
  }

  Product.init(
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
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.UUID,
        field: "category_id",
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
      },
      minStockLevel: {
        type: DataTypes.DECIMAL(10, 3),
        field: "min_stock_level",
      },
      addons: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      variations: {
        type: DataTypes.JSONB,
        defaultValue: [],
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
      modelName: "Product",
      tableName: "products",
      timestamps: true,
      underscored: true,
    },
  );

  return Product;
};
