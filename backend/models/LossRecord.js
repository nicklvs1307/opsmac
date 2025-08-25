'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LossRecord extends Model {
    static associate(models) {
      LossRecord.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      LossRecord.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant',
      });
      // Polymorphic association to Product or Ingredient
      LossRecord.belongsTo(models.Product, {
        foreignKey: 'stockableId',
        constraints: false,
        as: 'product',
      });
      LossRecord.belongsTo(models.Ingredient, {
        foreignKey: 'stockableId',
        constraints: false,
        as: 'ingredient',
      });
    }

    // Helper method to get the associated stockable item
    getStockable(options) {
      if (!this.stockableType) return Promise.resolve(null);
      const mixinMethodName = `get${this.stockableType}`;
      return this[mixinMethodName](options);
    }
  }

  LossRecord.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    stockableId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockableType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: { // User who registered the loss
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    reason: {
      type: DataTypes.ENUM('vencimento', 'avaria', 'qualidade', 'outro'),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lossDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'LossRecord',
    tableName: 'loss_records',
    timestamps: true,
    indexes: [
      {
        fields: ['stockableId', 'stockableType'],
      },
    ],
  });

  return LossRecord;
};