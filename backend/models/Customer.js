'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      Customer.hasMany(models.Checkin, { foreignKey: 'customer_id', as: 'checkins' });
      Customer.hasMany(models.Reward, { foreignKey: 'customer_id', as: 'rewards' });
      Customer.hasMany(models.SurveyResponse, { foreignKey: 'customer_id', as: 'surveyResponses' });
      Customer.hasMany(models.Feedback, { foreignKey: 'customer_id', as: 'feedbacks' });
      Customer.hasMany(models.Order, { foreignKey: 'customer_id', as: 'orders' });
      Customer.hasMany(models.WhatsappMessage, { foreignKey: 'customer_id', as: 'whatsappMessages' });
      Customer.hasMany(models.TableSession, { foreignKey: 'customer_id', as: 'tableSessions' });
    }
  }

  Customer.init({
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
      field: 'last_visit',
    },
    totalVisits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_visits',
    },
    totalSpent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_spent',
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'restaurant_id',
    },
    segments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    surveyResponsesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'survey_responses_count',
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
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
    underscored: true,
  });

  return Customer;
};
