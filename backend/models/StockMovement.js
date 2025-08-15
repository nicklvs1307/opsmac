const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StockMovement = sequelize.define('StockMovement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    stockable_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockable_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: { // 'in' for incoming, 'out' for outgoing
      type: DataTypes.ENUM('in', 'out'),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    movement_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    description: { // e.g., 'Initial stock', 'Sale', 'Return', 'Adjustment'
      type: DataTypes.STRING,
      allowNull: true
    },
    // You might add user_id who performed the movement, order_id, etc.
  }, {
    freezeTableName: true,
    tableName: 'stock_movements',
    indexes: [
      {
        fields: ['stockable_id', 'stockable_type']
      }
    ]
  });

  StockMovement.associate = (models) => {
    StockMovement.belongsTo(models.Product, {
      foreignKey: 'stockable_id',
      constraints: false,
      as: 'product'
    });
    StockMovement.belongsTo(models.Ingredient, {
      foreignKey: 'stockable_id',
      constraints: false,
      as: 'ingredient'
    });
  };

  // Helper method to get the associated stockable item (Product or Ingredient)
  StockMovement.prototype.getStockable = function(options) {
    if (!this.stockable_type) return Promise.resolve(null);
    const mixinMethodName = `get${this.stockable_type}`;
    return this[mixinMethodName](options);
  };

  return StockMovement;
};