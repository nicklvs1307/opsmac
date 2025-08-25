'use strict';
const { Model, DataTypes, Sequelize } = require('sequelize'); // Import Sequelize

module.exports = (sequelize) => {
  class TechnicalSpecification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TechnicalSpecification.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
      });
      // Add new association
      TechnicalSpecification.hasMany(models.RecipeIngredient, {
        foreignKey: 'technical_specification_id',
        as: 'recipeIngredients',
      });
    }
  }

  TechnicalSpecification.init({
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
  }, {
    sequelize,
    modelName: 'TechnicalSpecification',
    tableName: 'technical_specifications',
    timestamps: true, // Let Sequelize handle timestamps
  });

  return TechnicalSpecification;
};