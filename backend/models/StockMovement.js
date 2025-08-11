const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StockMovement = sequelize.define('StockMovement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    tableName: 'stock_movements'
  });

  StockMovement.associate = (models) => {
    StockMovement.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return StockMovement;
};