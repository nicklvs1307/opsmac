'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserRestaurant, {
        foreignKey: 'user_id',
        as: 'restaurants',
      });
      // Associations for permissions
      User.hasMany(models.UserRole, { foreignKey: 'user_id', as: 'userRoles' });
      User.hasMany(models.UserPermissionOverride, { foreignKey: 'user_id', as: 'permissionOverrides' });
      User.hasMany(models.AuditLog, { foreignKey: 'actor_user_id', as: 'auditLogs' });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.TEXT,
      field: 'password_hash',
    },
    isSuperadmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_superadmin',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true, // Even though global is false, setting here ensures mapping
  });

  return User;
};
