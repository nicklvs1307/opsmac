"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reward extends Model {
    static associate(models) {
      Reward.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
      });
      Reward.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      // Add association to Coupon
      Reward.hasMany(models.Coupon, {
        foreignKey: "rewardId", // Use camelCase for foreignKey in model definition
        as: "coupons",
      });
    }
  }

  Reward.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "customer_id",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRedeemed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_redeemed",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
      reward_type: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "reward_type",
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      validFrom: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "valid_from",
      },
      validUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "valid_until",
      },
      totalUsesLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "total_uses_limit",
      },
      currentUses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "current_uses",
      },
      maxUsesPerCustomer: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "max_uses_per_customer",
      },
      triggerConditions: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: "trigger_conditions",
      },
      wheelConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: "wheel_config",
      },
      analytics: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      couponValidityDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "coupon_validity_days",
      },
      daysValid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "days_valid",
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "created_by",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      sequelize,
      modelName: "Reward",
      tableName: "rewards",
      timestamps: true,
      underscored: true,
      hooks: {
        beforeSave: (reward, options) => {
          if (
            reward.reward_type === "spin_the_wheel" &&
            reward.wheel_config &&
            reward.wheel_config.items
          ) {
            reward.wheel_config.items.forEach((item) => {
              if (!item.id) {
                item.id = DataTypes.UUIDV4();
              }
            });
          }
        },
        beforeCreate: (reward, options) => {
          if (reward.days_valid && !reward.valid_until) {
            const validUntil = new Date(reward.valid_from);
            validUntil.setDate(validUntil.getDate() + reward.days_valid);
            reward.valid_until = validUntil;
          }
        },
        beforeUpdate: (reward, options) => {
          if (reward.changed("days_valid") && reward.days_valid) {
            const validUntil = new Date(reward.valid_from);
            validUntil.setDate(validUntil.getDate() + reward.days_valid);
            reward.valid_until = validUntil;
          }
        },
      },
    },
  );

  return Reward;
};
