const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Supplier extends Model {}

  Supplier.init({
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
    contact_person: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
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
    modelName: 'Supplier',
    tableName: 'suppliers',
    underscored: true,
    timestamps: true
  });

  Supplier.associate = (models) => {
    Supplier.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant'
    });
  };

  return Supplier;
};