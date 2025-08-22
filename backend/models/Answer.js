
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
      Answer.belongsTo(models.SurveyResponse, { foreignKey: 'response_id' });
      Answer.belongsTo(models.Question, { foreignKey: 'question_id', as: 'question' });
    }
  }

  Answer.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    response_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'survey_responses',
        key: 'id',
      },
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
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
    underscored: true,
  });

  return Answer;
};
