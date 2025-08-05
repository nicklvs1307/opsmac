'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NpsCriterion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NpsCriterion.init({
    name: DataTypes.STRING,
    restaurant_id: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'NpsCriterion',
  });
  return NpsCriterion;
};