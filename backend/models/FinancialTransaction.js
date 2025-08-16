const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialTransaction = sequelize.define('FinancialTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    type: { // 'income' or 'expense'
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true, // Can be null if no category is selected
      references: {
        model: 'financial_categories',
        key: 'id',
      },
    },
    payment_method: { // e.g., 'cash', 'credit_card', 'pix', 'bank_transfer'
      type: DataTypes.STRING,
      allowNull: true,
    },
    receipt_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    recurring_interval: { // e.g., 'daily', 'weekly', 'monthly', 'yearly'
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: true,
    },
    recurring_ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    user_id: { // User who recorded the transaction
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    freezeTableName: true,
    tableName: 'financial_transactions',
    underscored: true, // Add this line
  });

  FinancialTransaction.associate = (models) => {
    FinancialTransaction.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant',
    });
    FinancialTransaction.belongsTo(models.FinancialCategory, {
      foreignKey: 'category_id',
      as: 'category',
    });
    FinancialTransaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return FinancialTransaction;
};
