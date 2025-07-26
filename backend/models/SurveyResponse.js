
const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class SurveyResponse extends Model {}
  SurveyResponse.init({
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
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true, // Allow anonymous responses
      references: {
        model: 'customers',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'SurveyResponse',
    tableName: 'survey_responses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  SurveyResponse.associate = (models) => {
    SurveyResponse.belongsTo(models.Survey, { foreignKey: 'survey_id' });
    SurveyResponse.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    SurveyResponse.hasMany(models.Answer, { foreignKey: 'response_id', as: 'answers', onDelete: 'CASCADE' });
  };

  return SurveyResponse;
};
