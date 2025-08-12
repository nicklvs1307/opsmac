'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes, Sequelize) => {
  const TechnicalSpecification = sequelize.define('TechnicalSpecification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  }, {
    freezeTableName: true,
    tableName: 'technical_specifications',
    timestamps: false, // Using created_at and updated_at manually
  });

  TechnicalSpecification.associate = (models) => {
    TechnicalSpecification.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
    });
    // Add new association
    TechnicalSpecification.hasMany(models.RecipeIngredient, {
      foreignKey: 'technical_specification_id',
      as: 'recipeIngredients'
    });
  };

  return TechnicalSpecification;
};