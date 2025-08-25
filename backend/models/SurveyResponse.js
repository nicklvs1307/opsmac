
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SurveyResponse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SurveyResponse.belongsTo(models.Survey, { foreignKey: 'survey_id' });
      SurveyResponse.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
      SurveyResponse.hasMany(models.Answer, { foreignKey: 'response_id', as: 'answers', onDelete: 'CASCADE' });
    }
  }

  SurveyResponse.init({
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
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true, // Allow anonymous responses
      references: {
        model: 'customers',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'SurveyResponse',
    tableName: 'survey_responses',
    timestamps: true,
  });

  return SurveyResponse;
};
