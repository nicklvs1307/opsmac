'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LossRecord extends Model {
    static associate(models) {
      LossRecord.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      LossRecord.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      // Polymorphic association to Product or Ingredient
      LossRecord.belongsTo(models.Product, {
        foreignKey: 'stockable_id',
        constraints: false,
        as: 'product',
      });
      LossRecord.belongsTo(models.Ingredient, {
        foreignKey: 'stockable_id',
        constraints: false,
        as: 'ingredient',
      });
    }

    // Helper method to get the associated stockable item
    getStockable(options) {
      if (!this.stockable_type) return Promise.resolve(null);
      const mixinMethodName = `get${this.stockable_type}`;
      return this[mixinMethodName](options);
    }
  }

  LossRecord.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    stockable_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockable_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: { // User who registered the loss
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    restaurant_id: {
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
    loss_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'LossRecord',
    tableName: 'loss_records',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['stockable_id', 'stockable_type'],
      },
    ],
  });

  return LossRecord;
};