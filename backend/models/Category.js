'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      Category.hasMany(models.Product, {
        foreignKey: 'category_id',
        as: 'products',
      });
    }
  }
  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'unique_category_name_per_restaurant', // This refers to the unique constraint defined in the migration
      },
      restaurant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'Categories',
    }
  );
  return Category;
};