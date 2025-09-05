'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

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

      User.belongsToMany(models.Role, {
        through: models.UserRole,
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles',
      });
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
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
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
    loginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'login_attempts',
    },
    lockUntil: {
      type: DataTypes.DATE,
      field: 'lock_until',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
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

  // Instance Methods
  User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
  };

  User.prototype.isLocked = function () {
    // Check if the account is locked due to too many failed login attempts
    return this.lockUntil && this.lockUntil > new Date();
  };

  User.prototype.incrementLoginAttempts = async function () {
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
    const MAX_LOGIN_ATTEMPTS = 5;

    if (this.isLocked()) {
      return; // Already locked, do nothing
    }

    this.loginAttempts = (this.loginAttempts || 0) + 1;

    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.lockUntil = new Date(Date.now() + LOCK_TIME);
    }
    await this.save();
  };

  User.prototype.resetLoginAttempts = async function () {
    this.loginAttempts = 0;
    this.lockUntil = null;
    await this.save();
  };

  return User;
};
