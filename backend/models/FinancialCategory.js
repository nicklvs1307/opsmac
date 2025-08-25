'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class FinancialCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FinancialCategory.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
    }
  }

  FinancialCategory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: { // 'income', 'expense', or 'general'
      type: DataTypes.ENUM('income', 'expense', 'general'),
      allowNull: false,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'FinancialCategory',
    tableName: 'financial_categories',
    timestamps: true,
  });

  return FinancialCategory;
};
