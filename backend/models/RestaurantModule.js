'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RestaurantModule extends Model {
    static associate(models) {
      // No associations defined in the original file, so keeping it empty
    }
  }

  RestaurantModule.init({
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants', // Changed from 'Restaurants'
        key: 'id',
      },
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modules', // Changed from 'Modules'
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'RestaurantModule',
    tableName: 'restaurant_modules',
    underscored: true,
    timestamps: true,
  });

  return RestaurantModule;
};
