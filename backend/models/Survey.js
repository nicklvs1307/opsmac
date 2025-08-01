
const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class Survey extends Model {}
  Survey.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive', 'archived'),
      defaultValue: 'draft',
      allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('delivery_csat', 'menu_feedback', 'customer_profile', 'nps_only', 'performance_review', 'salon_ratings', 'salon_nps', 'delivery_nps', 'salon_csat', 'service_checklist', 'salon_like_dislike', 'custom'),
        allowNull: false,
    },
    restaurant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'restaurants',
            key: 'id'
        }
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
  }, {
    sequelize,
    modelName: 'Survey',
    tableName: 'surveys',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Survey.associate = (models) => {
    Survey.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    Survey.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Survey.hasMany(models.Question, { foreignKey: 'survey_id', as: 'questions', onDelete: 'CASCADE' });
    Survey.hasMany(models.SurveyResponse, { foreignKey: 'survey_id', as: 'responses', onDelete: 'CASCADE' });
  };

  return Survey;
};
