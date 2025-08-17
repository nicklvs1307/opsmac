const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialCategory = sequelize.define('FinancialCategory', {
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
    type: { // 'income', 'expense', or 'general'
      type: DataTypes.ENUM('income', 'expense', 'general'),
      allowNull: false,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
  }, {
    freezeTableName: true,
    tableName: 'financial_categories',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  FinancialCategory.associate = (models) => {
    FinancialCategory.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant',
    });
  };

  return FinancialCategory;
};
