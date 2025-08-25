'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Table extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Table.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      Table.hasMany(models.TableSession, {
        foreignKey: 'table_id',
        as: 'sessions',
      });
    }
  }

  Table.init({
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
    table_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'compositeIndex', // Ensures table_number is unique per restaurant
    },
    qr_code_url: {
      type: DataTypes.STRING,
      allowNull: true, // Will be generated later
    },
    // status: {
    //   type: DataTypes.ENUM('available', 'occupied', 'needs_cleaning'),
    //   defaultValue: 'available',
    //   allowNull: false
    // }
  }, {
    sequelize,
    modelName: 'Table',
    tableName: 'tables',
    indexes: [
      {
        unique: true,
        fields: ['restaurant_id', 'table_number'],
      },
    ],
    timestamps: true,
  });

  return Table;
};