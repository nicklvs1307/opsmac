'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class NpsCriterion extends Model {
    static associate(models) {
      NpsCriterion.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      NpsCriterion.hasMany(models.Question, { foreignKey: 'nps_criterion_id', as: 'questions' });
    }
  }

  NpsCriterion.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'NpsCriterion',
    tableName: 'nps_criterions',
    timestamps: true,
  });

  return NpsCriterion;
};