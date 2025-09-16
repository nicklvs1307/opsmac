"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class SurveyResponse extends Sequelize.Model {
    static associate(models) {
      SurveyResponse.belongsTo(models.Survey, {
        foreignKey: "survey_id",
        as: "survey",
      });
      SurveyResponse.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
      });
      SurveyResponse.hasMany(models.Answer, {
        foreignKey: "survey_response_id",
        as: "answers",
      });
      SurveyResponse.belongsTo(models.Restaurant, {
        foreignKey: "restaurantId",
        as: "restaurant",
      });
    }
  }

  SurveyResponse.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      surveyId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "survey_id",
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "customer_id",
      },
      npsScore: {
        type: DataTypes.INTEGER,
        field: "nps_score",
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
      modelName: "SurveyResponse",
      tableName: "survey_responses",
      timestamps: true,
      underscored: true,
    },
  );

  return SurveyResponse;
};