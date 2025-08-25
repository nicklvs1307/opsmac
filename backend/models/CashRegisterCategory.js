'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CashRegisterCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CashRegisterCategory.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant',
      });
    }
  }

  CashRegisterCategory.init({
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
    type: {
      type: DataTypes.ENUM('withdrawal', 'reinforcement', 'general'),
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'CashRegisterCategory',
    tableName: 'cash_register_categories',
    timestamps: true,
  });

  return CashRegisterCategory;
};
