"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Goal extends Model {
    static associate(models) {
      Goal.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  Goal.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      targetValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "target_value",
      },
      currentValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: "current_value",
      },
      metric: {
        type: DataTypes.STRING,
        allowNull: false,
      }, // e.g., 'totalCheckins', 'newCustomers', 'avgNpsScore', 'totalLoyaltyPoints'
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "start_date",
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "end_date",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      }, // e.g., 'active', 'completed', 'achieved', 'failed'
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
      modelName: "Goal",
      tableName: "goals",
      timestamps: true,
      underscored: true,
    },
  );

  return Goal;
};
