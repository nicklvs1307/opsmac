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
      cuisineType: {
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
      zipCode: {
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
      whatsappApiUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      whatsappApiKey: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      whatsappInstanceId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      whatsappPhoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      logo: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      coverImage: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      openingHours: {
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
      socialMedia: {
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
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      isOpen: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      posStatus: {
        type: Sequelize.ENUM('open', 'closed'),
        defaultValue: 'closed',
        allowNull: false,
      },
      subscriptionPlan: {
        type: Sequelize.ENUM('free', 'basic', 'premium', 'enterprise'),
        defaultValue: 'free',
      },
      subscriptionExpires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      totalTables: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      averageRating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      totalFeedbacks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      npsScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalPromoters: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      totalNeutrals: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      totalDetractors: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      apiToken: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      npsCriteriaScores: {
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