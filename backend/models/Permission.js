'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Permission.belongsToMany(models.Role, {
        through: 'RolePermissions',
        foreignKey: 'permissionId',
        otherKey: 'roleId',
        as: 'roles'
      });

      Permission.belongsTo(models.Module, {
        foreignKey: 'moduleId',
        as: 'module'
      });
    }
  }
  Permission.init({
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
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'modules',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Permission',
    tableName: 'Permissions', // Ensure this matches the migration table name
  });
  return Permission;
};