
const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class Question extends Model {}
  Question.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    survey_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'surveys',
        key: 'id'
      }
    },
    question_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    question_type: {
      type: DataTypes.ENUM('text', 'textarea', 'radio', 'checkboxes', 'dropdown', 'nps', 'csat', 'ratings', 'like_dislike'),
      allowNull: false,
    },
    options: {
      type: DataTypes.JSONB, // For radio, checkboxes, dropdown
      allowNull: true,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    nps_criterion: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
    timestamps: false,
  });

  Question.associate = (models) => {
    Question.belongsTo(models.Survey, { foreignKey: 'survey_id' });
    Question.hasMany(models.Answer, { foreignKey: 'question_id', as: 'answers', onDelete: 'CASCADE' });
    Question.belongsTo(models.NpsCriterion, { foreignKey: 'nps_criterion_id', as: 'npsCriterion' });
  };

  return Question;
};
