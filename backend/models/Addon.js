const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Addon extends Model {}

  Addon.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    restaurant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'restaurants',
            key: 'id'
        }
    }
  }, {
    sequelize,
    modelName: 'Addon',
    tableName: 'addons',
    underscored: true, // To match created_at and updated_at
    timestamps: true
  });

  Addon.associate = (models) => {
    Addon.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant'
    });
  };

  return Addon;
};