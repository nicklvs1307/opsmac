const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Stock = sequelize.define('Stock', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    stockable_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockable_type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'stocks',
    indexes: [
      {
        unique: true,
        fields: ['stockable_id', 'stockable_type']
      }
    ],
    underscored: true,
  });

  Stock.associate = (models) => {
    Stock.belongsTo(models.Product, {
      foreignKey: 'stockable_id',
      constraints: false,
      as: 'product'
    });
    Stock.belongsTo(models.Ingredient, {
      foreignKey: 'stockable_id',
      constraints: false,
      as: 'ingredient'
    });
  };

  // Helper method to get the associated stockable item (Product or Ingredient)
  Stock.prototype.getStockable = function(options) {
    if (!this.stockable_type) return Promise.resolve(null);
    const mixinMethodName = `get${this.stockable_type}`;
    return this[mixinMethodName](options);
  };

  return Stock;
};