
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Answer.belongsTo(models.SurveyResponse, { foreignKey: 'responseId' });
      Answer.belongsTo(models.Question, { foreignKey: 'questionId', as: 'question' });
    }
  }

  Answer.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    responseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'survey_responses',
        key: 'id',
      },
    },
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    answerValue: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Answer',
    tableName: 'answers',
    timestamps: false,
  });

  return Answer;
};
