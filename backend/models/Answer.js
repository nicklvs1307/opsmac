export default (sequelize, DataTypes) => {
  class Answer extends Model {
    static associate(models) {
      Answer.belongsTo(models.SurveyResponse, {
        foreignKey: "survey_response_id",
        as: "surveyResponse",
      });
      Answer.belongsTo(models.Question, {
        foreignKey: "question_id",
        as: "question",
      });
    }
  }

  Answer.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      surveyResponseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "survey_response_id",
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "question_id",
      },
      value: {
        type: DataTypes.TEXT,
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
      modelName: "Answer",
      tableName: "answers",
      timestamps: true,
      underscored: true,
    },
  );

  return Answer;
};
