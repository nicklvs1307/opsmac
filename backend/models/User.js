'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { LOGIN_ATTEMPTS_LIMIT, LOGIN_LOCK_DURATION_HOURS } = require('../config/security');

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Restaurant, {
        foreignKey: 'ownerId',
        as: 'ownedRestaurants', // Renomeado para evitar conflito
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        targetKey: 'id',
      });

      User.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant',
      });

      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role'
      });
    }

    // Static method to include restaurant and module details
    static withRestaurantDetails(models) {
      return [
          {
            model: models.Restaurant,
            as: 'ownedRestaurants',
            where: { isActive: true },
            required: false,
            include: [{ model: models.Module, as: 'modules', attributes: ['name'], through: { attributes: [] } }],
          },
          {
            model: models.Restaurant,
            as: 'restaurant',
            where: { isActive: true },
            required: false,
            include: [{ model: models.Module, as: 'modules', attributes: ['name'], through: { attributes: [] } }],
          },
        ];
    }

    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }

    isLocked() {
      return !!(this.lockedUntil && this.lockedUntil > Date.now());
    }

    async incrementLoginAttempts() {
      // Se já passou do tempo de bloqueio, resetar tentativas
      if (this.lockedUntil && this.lockedUntil < Date.now()) {
        return this.update({
          loginAttempts: 1,
          lockedUntil: null,
        });
      }

      const updates = { loginAttempts: this.loginAttempts + 1 };

      // Bloquear após LOGIN_ATTEMPTS_LIMIT tentativas por LOGIN_LOCK_DURATION_HOURS
      if (this.loginAttempts + 1 >= LOGIN_ATTEMPTS_LIMIT && !this.isLocked()) {
        updates.lockedUntil = Date.now() + LOGIN_LOCK_DURATION_HOURS * 60 * 60 * 1000;
      }

      return this.update(updates);
    }

    async resetLoginAttempts() {
      return this.update({
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      });
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      delete values.passwordResetToken;
      delete values.emailVerificationToken;
      delete values.loginAttempts;
      delete values.lockedUntil;
      return values;
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório',
        },
        len: {
          args: [2, 100],
          msg: 'Nome deve ter entre 2 e 100 caracteres',
        },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        msg: 'Este email já está em uso',
      },
      validate: {
        isEmail: {
          msg: 'Email deve ter um formato válido',
        },
        notEmpty: {
          msg: 'Email é obrigatório',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Senha é obrigatória',
        },
        len: {
          args: [6, 255],
          msg: 'Senha deve ter pelo menos 6 caracteres',
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'Telefone deve ter um formato válido',
        },
      },
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Roles',
            key: 'id'
        }
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['roleId'],
      },
      {
        fields: ['isActive'],
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    timestamps: true,
  });

  return User;
};