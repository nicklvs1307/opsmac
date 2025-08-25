'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PrintedLabel extends Model {
    static associate(models) {
      PrintedLabel.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      PrintedLabel.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant',
      });
      // Polymorphic association to Product or Ingredient
      PrintedLabel.belongsTo(models.Product, {
        foreignKey: 'labelableId',
        constraints: false,
        as: 'product',
      });
      PrintedLabel.belongsTo(models.Ingredient, {
        foreignKey: 'labelableId',
        constraints: false,
        as: 'ingredient',
      });
    }

    // Helper method to get the associated labelable item
    getLabelable(options) {
      if (!this.labelableType) return Promise.resolve(null);
      const mixinMethodName = `get${this.labelableType}`;
      return this[mixinMethodName](options);
    }
  }

  PrintedLabel.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    labelableId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    labelableType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: { // User who printed the label
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    printDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    quantityPrinted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    lotNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sif: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
    },
    unitOfMeasure: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'PrintedLabel',
    tableName: 'printed_labels',
    timestamps: true,
    indexes: [
      {
        fields: ['labelableId', 'labelableType'],
      },
      {
        fields: ['expirationDate'],
      },
    ],
  });

  return PrintedLabel;
};