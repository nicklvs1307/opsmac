'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Ingredient extends Model {
    static associate(models) {
      Ingredient.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      Ingredient.hasMany(models.RecipeIngredient, {
        foreignKey: 'ingredient_id',
        as: 'recipeIngredients',
      });

      // Associação polimórfica com Stock
      Ingredient.hasOne(models.Stock, {
        foreignKey: 'stockable_id',
        constraints: false,
        scope: {
          stockable_type: 'Ingredient',
        },
        as: 'stock',
      });

      // Associação polimórfica com StockMovement
      Ingredient.hasMany(models.StockMovement, {
        foreignKey: 'stockable_id',
        constraints: false,
        scope: {
          stockable_type: 'Ingredient',
        },
        as: 'stockMovements',
      });
    }
  }
  Ingredient.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Nome do ingrediente é obrigatório' },
        len: { args: [2, 100], msg: 'Nome deve ter entre 2 e 100 caracteres' },
      },
    },
    unit_of_measure: {
      type: DataTypes.ENUM('g', 'kg', 'ml', 'L', 'unidade', 'colher de chá', 'colher de sopa', 'xícara', 'pitada', 'a gosto'),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Unidade de medida é obrigatória' },
      },
    },
    cost_per_unit: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0.0000,
      validate: {
        isDecimal: { msg: 'Custo por unidade deve ser um número decimal' },
        min: { args: [0], msg: 'Custo por unidade não pode ser negativo' },
      },
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    default_expiration_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    default_label_status: {
      type: DataTypes.ENUM('RESFRIADO', 'CONGELADO', 'AMBIENTE'),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Ingredient',
    tableName: 'ingredients',
    timestamps: true,
  });
  return Ingredient;
};
