'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Module extends Model {
    static associate(models) {
      Module.belongsToMany(models.Restaurant, {
        through: 'restaurant_modules',
        foreignKey: 'moduleId',
        otherKey: 'restaurantId',
        as: 'restaurants',
      });
    }
  }

  Module.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Module',
    tableName: 'modules',
    timestamps: true,
  });

  return Module;
};
