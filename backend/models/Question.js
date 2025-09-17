"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class Question extends Sequelize.Model {
    static associate(models) {
      Question.belongsTo(models.Survey, {
        foreignKey: "survey_id",
        as: "survey",
      });
      Question.hasMany(models.Answer, {
        foreignKey: "question_id",
        as: "answers",
      });
      Question.belongsTo(models.NpsCriterion, {
        foreignKey: "nps_criterion_id",
        as: "npsCriterion",
      });
    }
  }

  Question.init(
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
      npsCriterionId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "nps_criterion_id",
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "Question",
      tableName: "questions",
      timestamps: true,
      underscored: true,
    },
  );

  return Question;
};
