'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { LOGIN_ATTEMPTS_LIMIT, LOGIN_LOCK_DURATION_HOURS } = require('../../config/security');

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Restaurant, {
        foreignKey: 'owner_id',
        as: 'owned_restaurants', // Renomeado para evitar conflito
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      User.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
    }

    // Static method to include restaurant and module details
    static withRestaurantDetails(models) {
      return {
        include: [
          {
            model: models.Restaurant,
            as: 'owned_restaurants',
            where: { is_active: true },
            required: false,
            include: [{ model: models.Module, as: 'modules', attributes: ['name'], through: { attributes: [] } }],
          },
          {
            model: models.Restaurant,
            as: 'restaurant',
            where: { is_active: true },
            required: false,
            include: [{ model: models.Module, as: 'modules', attributes: ['name'], through: { attributes: [] } }],
          },
        ],
      };
    }

    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }

    isLocked() {
      return !!(this.locked_until && this.locked_until > Date.now());
    }

    async incrementLoginAttempts() {
      // Se já passou do tempo de bloqueio, resetar tentativas
      if (this.locked_until && this.locked_until < Date.now()) {
        return this.update({
          login_attempts: 1,
          locked_until: null,
        });
      }

      const updates = { login_attempts: this.login_attempts + 1 };

      // Bloquear após LOGIN_ATTEMPTS_LIMIT tentativas por LOGIN_LOCK_DURATION_HOURS
      if (this.login_attempts + 1 >= LOGIN_ATTEMPTS_LIMIT && !this.isLocked()) {
        updates.locked_until = Date.now() + LOGIN_LOCK_DURATION_HOURS * 60 * 60 * 1000;
      }

      return this.update(updates);
    }

    async resetLoginAttempts() {
      return this.update({
        login_attempts: 0,
        locked_until: null,
        last_login: new Date(),
      });
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      delete values.password_reset_token;
      delete values.email_verification_token;
      delete values.login_attempts;
      delete values.locked_until;
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
    role: {
      type: DataTypes.ENUM('admin', 'owner', 'manager', 'super_admin', 'waiter'),
      defaultValue: 'owner',
      allowNull: false,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    locked_until: {
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
        fields: ['role'],
      },
      {
        fields: ['is_active'],
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
    underscored: true,
    timestamps: true,
  });

  return User;
};