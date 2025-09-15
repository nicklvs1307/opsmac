"use strict";
import { Model } from "sequelize";

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      Customer.hasMany(models.Checkin, {
        foreignKey: "customer_id",
        as: "checkins",
      });
      Customer.hasMany(models.Reward, {
        foreignKey: "customer_id",
        as: "rewards",
      });
      Customer.hasMany(models.SurveyResponse, {
        foreignKey: "customer_id",
        as: "surveyResponses",
      });
      Customer.hasMany(models.Feedback, {
        foreignKey: "customer_id",
        as: "feedbacks",
      });
      Customer.hasMany(models.Order, {
        foreignKey: "customer_id",
        as: "orders",
      });
      Customer.hasMany(models.WhatsappMessage, {
        foreignKey: "customer_id",
        as: "whatsappMessages",
      });
      Customer.hasMany(models.TableSession, {
        foreignKey: "customer_id",
        as: "tableSessions",
      });
      Customer.hasMany(models.Coupon, {
        foreignKey: "customerId",
        as: "coupons",
      });
    }

    async addLoyaltyPoints(points, source) {
      this.loyaltyPoints = (this.loyaltyPoints || 0) + points;
      // Optionally, you could add a loyalty transaction record here
      await this.save();
    }

    async updateStats() {
      // Recalculate total visits
      const totalVisits = await this.getCheckins({
        attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      });
      this.totalVisits = totalVisits[0].dataValues.count;

      // Recalculate total spent (assuming 'orders' association exists and has a 'total' field)
      const totalSpentResult = await this.getOrders({
        attributes: [[sequelize.fn("SUM", sequelize.col("total")), "sum"]],
      });
      this.totalSpent = totalSpentResult[0].dataValues.sum || 0;

      await this.save();
    }
  }

  Customer.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
      },
      birthday: {
        type: DataTypes.DATEONLY,
      },
      cpf: {
        type: DataTypes.STRING,
        unique: true,
      },
      lastVisit: {
        type: DataTypes.DATE,
        field: "last_visit",
      },
      totalVisits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "total_visits",
      },
      totalSpent: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: "total_spent",
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
      },
      segments: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      surveyResponsesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "survey_responses_count",
      },
      loyaltyPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "loyalty_points",
      },
      averageRatingGiven: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        field: "average_rating_given",
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
      modelName: "Customer",
      tableName: "customers",
      timestamps: true,
      underscored: true,
    },
  );

  return Customer;
};
