'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.belongsToMany(models.Permission, {
        through: 'RolePermissions',
        foreignKey: 'roleId',
        otherKey: 'permissionId',
        as: 'permissions'
      });

      Role.hasMany(models.User, {
        foreignKey: 'roleId',
        as: 'users'
      });

      Role.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
    }
  }
  Role.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: true, // Null for global roles
      references: {
        model: 'restaurants',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'Roles', // Ensure this matches the migration table name
  });
  return Role;
};