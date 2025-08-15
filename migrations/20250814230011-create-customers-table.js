'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      cpf: {
        type: Sequelize.STRING(11),
        allowNull: true,
        unique: true,
      },
      whatsapp: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      preferences: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          cuisine_types: [],
          dietary_restrictions: [],
          communication_preferences: {
            email: true,
            whatsapp: false,
            sms: false
          },
          favorite_dishes: [],
          allergies: []
        },
      },
      loyalty_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_visits: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_spent: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      average_rating_given: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      last_visit: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      first_visit: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      customer_segment: {
        type: Sequelize.ENUM('new', 'regular', 'vip', 'inactive'),
        defaultValue: 'new',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'blocked'),
        defaultValue: 'active',
      },
      source: {
        type: Sequelize.ENUM('qrcode', 'whatsapp', 'tablet', 'web', 'referral', 'social_media', 'checkin_qrcode'),
        allowNull: true,
      },
      referral_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      referred_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      marketing_consent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      phone_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      gdpr_consent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      gdpr_consent_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_birthday_message_year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          acquisition_source: null,
          utm_campaign: null,
          utm_source: null,
          utm_medium: null,
          device_info: null,
          location_data: null
        },
      },
      rfv_score: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          recency: null,
          frequency: null,
          monetary: null
        },
      },
      nps_segment: {
        type: Sequelize.ENUM('promoter', 'passive', 'detractor', 'unknown'),
        allowNull: true,
        defaultValue: 'unknown',
      },
      last_purchase_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      total_orders: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      average_ticket: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      last_ticket_value: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      most_bought_products: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      most_bought_categories: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      purchase_behavior_tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      location_details: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          neighborhood: null,
          city: null,
          zone: null,
          distance_from_store: null
        },
      },
      preferred_communication_channel: {
        type: Sequelize.ENUM('whatsapp', 'email', 'sms', 'push_notification', 'none'),
        allowNull: true,
        defaultValue: 'none',
      },
      campaign_interaction_history: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      last_survey_completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_survey_id: {
        type: Sequelize.UUID,
        allowNull: true,
        // Temporarily remove references to Surveys due to circular dependency
        // references: {
        //   model: 'Surveys',
        //   key: 'id',
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL',
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
    await queryInterface.dropTable('customers');
  }
};