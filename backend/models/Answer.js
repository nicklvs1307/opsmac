
const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class Answer extends Model {}
  Answer.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    response_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'survey_responses',
        key: 'id'
      }
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      }
    },
    answer_value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Answer',
    tableName: 'answers',
    timestamps: false,
  });

  Answer.associate = (models) => {
    Answer.belongsTo(models.SurveyResponse, { foreignKey: 'response_id' });
    Answer.belongsTo(models.Question, { foreignKey: 'question_id' });
  };

  return Answer;
};
