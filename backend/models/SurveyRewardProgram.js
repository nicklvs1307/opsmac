"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SurveyRewardProgram extends Model {
    static associate(models) {
      SurveyRewardProgram.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  SurveyRewardProgram.init(
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
      rewards_per_response: {
        type: DataTypes.JSONB,
        defaultValue: [],
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
      modelName: "SurveyRewardProgram",
      tableName: "survey_reward_programs",
      timestamps: true,
      underscored: true,
    },
  );

  return SurveyRewardProgram;
};
