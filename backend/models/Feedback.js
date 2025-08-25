'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Feedback.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
        onDelete: 'CASCADE',
      });
      Feedback.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer',
        onDelete: 'SET NULL',
      });
    }

    getNPSCategory() {
      if (!this.nps_score) return null;

      if (this.nps_score >= 9) return 'promoter';
      if (this.nps_score >= 7) return 'passive';
      return 'detractor';
    }

    isPositive() {
      return this.rating >= 4 || this.sentiment === 'positive';
    }

    isNegative() {
      return this.rating <= 2 || this.sentiment === 'negative';
    }

    requiresResponse() {
      return this.feedback_type === 'complaint' ||
        this.priority === 'high' ||
        this.priority === 'urgent' ||
        this.rating <= 2;
    }

    async markAsResponded(responseText, respondedBy) {
      return this.update({
        status: 'responded',
        response_text: responseText,
        response_date: new Date(),
        responded_by: respondedBy,
      });
    }
  }

  Feedback.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'Avaliação deve ser entre 1 e 5',
        },
        max: {
          args: 5,
          msg: 'Avaliação deve ser entre 1 e 5',
        },
      },
    },
    nps_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'NPS deve ser entre 0 e 10',
        },
        max: {
          args: 10,
          msg: 'NPS deve ser entre 0 e 10',
        },
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feedback_type: {
      type: DataTypes.ENUM('compliment', 'complaint', 'suggestion', 'general'),
      defaultValue: 'general',
    },
    source: {
      type: DataTypes.ENUM('qrcode', 'whatsapp', 'tablet', 'web', 'email', 'manual'),
      allowNull: false,
    },
    table_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'Número da mesa deve ser positivo',
        },
      },
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    visit_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    categories: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        food_quality: null,
        service_quality: null,
        ambiance: null,
        price_value: null,
        cleanliness: null,
        speed: null,
      },
    },
    sentiment: {
      type: DataTypes.ENUM('positive', 'neutral', 'negative'),
      allowNull: true,
    },
    sentiment_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: {
          args: -1,
          msg: 'Score de sentimento deve ser entre -1 e 1',
        },
        max: {
          args: 1,
          msg: 'Score de sentimento deve ser entre -1 e 1',
        },
      },
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'responded', 'resolved', 'archived'),
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verification_method: {
      type: DataTypes.ENUM('email', 'phone', 'receipt', 'none'),
      defaultValue: 'none',
    },
    response_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    response_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    responded_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    follow_up_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    follow_up_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        ip_address: null,
        user_agent: null,
        device_type: null,
        location: null,
        session_id: null,
      },
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedbacks',
    timestamps: true,
    indexes: [
      {
        fields: ['restaurant_id'],
      },
      {
        fields: ['customer_id'],
      },
      {
        fields: ['rating'],
      },
      {
        fields: ['nps_score'],
      },
      {
        fields: ['feedback_type'],
      },
      {
        fields: ['source'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['sentiment'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['visit_date'],
      },
    ],
    hooks: {
      beforeCreate: (feedback) => {
        // Determinar sentimento baseado na avaliação
        if (!feedback.sentiment && feedback.rating) {
          if (feedback.rating >= 4) {
            feedback.sentiment = 'positive';
            feedback.sentiment_score = 0.7;
          } else if (feedback.rating >= 3) {
            feedback.sentiment = 'neutral';
            feedback.sentiment_score = 0.0;
          } else {
            feedback.sentiment = 'negative';
            feedback.sentiment_score = -0.7;
          }
        }

        // Determinar prioridade baseada na avaliação e tipo
        if (!feedback.priority) {
          if (feedback.feedback_type === 'complaint' || feedback.rating <= 2) {
            feedback.priority = 'high';
          } else if (feedback.rating === 3) {
            feedback.priority = 'medium';
          } else {
            feedback.priority = 'low';
          }
        }

        // Determinar tipo de feedback baseado na avaliação e comentário
        if (!feedback.feedback_type || feedback.feedback_type === 'general') {
          if (feedback.rating <= 2) {
            feedback.feedback_type = 'complaint';
          } else if (feedback.rating >= 4) {
            feedback.feedback_type = 'compliment';
          }
        }
      },
      afterCreate: async (feedback) => {
        // Atualizar estatísticas do restaurante
        const restaurant = await feedback.getRestaurant();
        if (restaurant) {
          await restaurant.updateStats();
        }
      },
      afterUpdate: async (feedback) => {
        // Atualizar estatísticas do restaurante se a avaliação mudou
        if (feedback.changed('rating') || feedback.changed('nps_score')) {
          const restaurant = await feedback.getRestaurant();
          if (restaurant) {
            await restaurant.updateStats();
          }
        }
      },
    },
  });

  return Feedback;
};