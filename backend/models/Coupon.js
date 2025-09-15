"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      // Add association to Reward
      Coupon.belongsTo(models.Reward, {
        foreignKey: "rewardId", // Use camelCase for foreignKey in model definition
        as: "reward",
      });
      Coupon.belongsTo(models.Customer, {
        foreignKey: "customerId",
        as: "customer",
      });
    }
  }

  Coupon.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      discountType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "discount_type",
      },
      discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "discount_value",
      },
      expirationDate: {
        type: DataTypes.DATE,
        field: "expiration_date",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_active",
      },
      status: {
        type: DataTypes.ENUM(
          "generated",
          "sent",
          "redeemed",
          "expired",
          "cancelled",
          "used",
        ),
        allowNull: false,
        defaultValue: "generated",
        field: "status",
      },
      rewardId: {
        // Add this field (camelCase)
        type: DataTypes.UUID,
        allowNull: false, // Assuming a coupon must always be linked to a reward
        field: "reward_id", // Explicitly map to snake_case column in DB for clarity, though underscored:true would handle it
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "customer_id",
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
      redeemedAt: {
        type: DataTypes.DATE,
        field: "redeemed_at",
      },
      cancelledAt: {
        type: DataTypes.DATE,
        field: "cancelled_at",
      },
    },
    {
      sequelize,
      modelName: "Coupon",
      tableName: "coupons",
      timestamps: true,
      underscored: true, // This will map camelCase attributes to snake_case columns
      hooks: {
        beforeUpdate: (coupon, options) => {
          if (
            coupon.changed("status") &&
            coupon.status === "redeemed" &&
            !coupon.redeemedAt
          ) {
            coupon.redeemedAt = new Date();
          }

          if (
            coupon.changed("status") &&
            coupon.status === "cancelled" &&
            !coupon.cancelledAt
          ) {
            coupon.cancelledAt = new Date();
          }
        },
        afterUpdate: async (coupon, options) => {
          if (coupon.changed("status") && coupon.status === "redeemed") {
            const reward = await coupon.getReward();
            if (reward) {
              await reward.updateAnalytics("redeemed", coupon.orderValue || 0);
            }
          }
        },
      },
    },
  );

  return Coupon;
};
