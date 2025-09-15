"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Survey extends Model {
    static associate(models) {
      Survey.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      Survey.hasMany(models.Question, {
        foreignKey: "survey_id",
        as: "questions",
      });
      Survey.hasMany(models.SurveyResponse, {
        foreignKey: "survey_id",
        as: "responses",
      });
    }
  }

  Survey.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
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
    },
    {
      sequelize,
      modelName: "Survey",
      tableName: "surveys",
      timestamps: true,
      underscored: true,
    },
  );

  return Survey;
};
