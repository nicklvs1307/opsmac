const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CashRegisterCategory = sequelize.define('CashRegisterCategory', {
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
    tableName: 'cash_register_categories',
    underscored: true,
  });

  CashRegisterCategory.associate = (models) => {
    CashRegisterCategory.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant',
    });
  };

  return CashRegisterCategory;
};
