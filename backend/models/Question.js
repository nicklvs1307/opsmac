
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Question.belongsTo(models.Survey, { foreignKey: 'survey_id' });
      Question.hasMany(models.Answer, { foreignKey: 'question_id', as: 'answers', onDelete: 'CASCADE' });
      Question.belongsTo(models.NpsCriterion, { foreignKey: 'nps_criterion_id', as: 'npsCriterion' });
    }
  }

  Question.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    survey_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'surveys',
        key: 'id',
      },
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
    nps_criterion_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'nps_criterions', // Changed from 'NpsCriterions' to 'nps_criterions' for consistency
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
    timestamps: true, // Changed from false to true for consistency
    underscored: true,
  });

  return Question;
};
