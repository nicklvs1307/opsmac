'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cuisine_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      zip_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      whatsapp_api_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      whatsapp_api_key: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      whatsapp_instance_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      whatsapp_phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      logo: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      cover_image: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      opening_hours: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '22:00', closed: false },
          saturday: { open: '09:00', close: '22:00', closed: false },
          sunday: { open: '09:00', close: '22:00', closed: false }
        },
      },
      social_media: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: { facebook: '', instagram: '', twitter: '', whatsapp: '' },
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          feedback_enabled: true,
          whatsapp_enabled: false,
          rewards_enabled: true,
          auto_response: true,
          nps_enabled: true,
          tablet_mode: false,
          checkin_requires_table: false,
          checkin_program_settings: {},
          survey_program_settings: {},
          primary_color: '#3f51b5',
          secondary_color: '#f50057',
          integrations: {},
          enabled_modules: []
        },
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_open: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      pos_status: {
        type: Sequelize.ENUM('open', 'closed'),
        defaultValue: 'closed',
        allowNull: false,
      },
      subscription_plan: {
        type: Sequelize.ENUM('free', 'basic', 'premium', 'enterprise'),
        defaultValue: 'free',
      },
      subscription_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      total_tables: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      average_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      total_feedbacks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      nps_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_promoters: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      total_neutrals: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      total_detractors: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      api_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      nps_criteria_scores: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('restaurants');
  }
};