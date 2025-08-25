'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RecipeIngredient extends Model {
    static associate(models) {
      RecipeIngredient.belongsTo(models.TechnicalSpecification, {
        foreignKey: 'technical_specification_id',
        as: 'technicalSpecification',
      });
      RecipeIngredient.belongsTo(models.Ingredient, {
        foreignKey: 'ingredient_id',
        as: 'ingredient',
      });
    }
  }
  RecipeIngredient.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    technical_specification_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'technical_specifications',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    ingredient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ingredients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'Quantidade deve ser um número decimal' },
        min: { args: [0], msg: 'Quantidade não pode ser negativa' },
      },
    },
  }, {
    sequelize,
    modelName: 'RecipeIngredient',
    tableName: 'recipe_ingredients',
    timestamps: true,
  });
  return RecipeIngredient;
};
