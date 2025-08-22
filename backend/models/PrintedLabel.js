'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PrintedLabel extends Model {
    static associate(models) {
      PrintedLabel.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      PrintedLabel.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      // Polymorphic association to Product or Ingredient
      PrintedLabel.belongsTo(models.Product, {
        foreignKey: 'labelable_id',
        constraints: false,
        as: 'product',
      });
      PrintedLabel.belongsTo(models.Ingredient, {
        foreignKey: 'labelable_id',
        constraints: false,
        as: 'ingredient',
      });
    }

    // Helper method to get the associated labelable item
    getLabelable(options) {
      if (!this.labelable_type) return Promise.resolve(null);
      const mixinMethodName = `get${this.labelable_type}`;
      return this[mixinMethodName](options);
    }
  }

  PrintedLabel.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    labelable_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    labelable_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: { // User who printed the label
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
    print_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    quantity_printed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    lot_number: {
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
    unit_of_measure: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'PrintedLabel',
    tableName: 'printed_labels',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['labelable_id', 'labelable_type'],
      },
      {
        fields: ['expiration_date'],
      },
    ],
  });

  return PrintedLabel;
};