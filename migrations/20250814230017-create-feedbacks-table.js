'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('feedbacks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nps_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      feedback_type: {
        type: Sequelize.ENUM('compliment', 'complaint', 'suggestion', 'general'),
        defaultValue: 'general',
      },
      source: {
        type: Sequelize.ENUM('qrcode', 'whatsapp', 'tablet', 'web', 'email', 'manual'),
        allowNull: false,
      },
      table_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      order_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      visit_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      categories: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          food_quality: null,
          service_quality: null,
          ambiance: null,
          price_value: null,
          cleanliness: null,
          speed: null
        },
      },
      sentiment: {
        type: Sequelize.ENUM('positive', 'neutral', 'negative'),
        allowNull: true,
      },
      sentiment_score: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
      },
      keywords: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'responded', 'resolved', 'archived'),
        defaultValue: 'pending',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      is_anonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verification_method: {
        type: Sequelize.ENUM('email', 'phone', 'receipt', 'none'),
        defaultValue: 'none',
      },
      response_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      response_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      responded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      follow_up_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      follow_up_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      internal_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          ip_address: null,
          user_agent: null,
          device_type: null,
          location: null,
          session_id: null
        },
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('feedbacks');
  }
};