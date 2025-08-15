'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('qr_codes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      table_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      table_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      qr_type: {
        type: Sequelize.ENUM('feedback', 'checkin', 'menu'),
        defaultValue: 'feedback',
        allowNull: false,
      },
      qr_code_data: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      qr_code_image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      feedback_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      short_url: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_generic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      location_description: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      area: {
        type: Sequelize.ENUM('indoor', 'outdoor', 'terrace', 'private', 'bar', 'vip'),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('available', 'occupied', 'reserved', 'maintenance', 'inactive'),
        defaultValue: 'available',
      },
      total_scans: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_feedbacks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      last_scan: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_feedback: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      average_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          auto_redirect: true,
          show_menu: false,
          collect_contact: true,
          require_rating: true,
          enable_photos: true,
          custom_message: '',
          theme_color: '#007bff'
        },
      },
      analytics: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          daily_scans: {},
          peak_hours: {},
          conversion_rate: 0,
          average_session_time: 0,
          bounce_rate: 0
        },
      },
      custom_fields: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      print_settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          size: 'medium',
          include_logo: true,
          include_table_info: true,
          include_instructions: true,
          paper_size: 'A4',
          orientation: 'portrait'
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
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('qr_codes');
  }
};