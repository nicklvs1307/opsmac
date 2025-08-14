module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('qr_codes');
    if (!tableExists) {
      await queryInterface.createTable('qr_codes', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
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
          allowNull: false
        },
        qr_code_image: {
          type: Sequelize.TEXT, // Base64 encoded image
          allowNull: true
        },
        feedback_url: {
          type: Sequelize.STRING(500),
          allowNull: false
        },
        short_url: {
          type: Sequelize.STRING(100),
          allowNull: true,
          unique: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        is_generic: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
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
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('available', 'occupied', 'reserved', 'maintenance', 'inactive'),
          defaultValue: 'available'
        },
        total_scans: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_feedbacks: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        last_scan: {
          type: Sequelize.DATE,
          allowNull: true
        },
        last_feedback: {
          type: Sequelize.DATE,
          allowNull: true
        },
        average_rating: {
          type: Sequelize.DECIMAL(3, 2),
          defaultValue: 0.00
        },
        settings: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
        },
        analytics: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
        },
        custom_fields: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        print_settings: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
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
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('qr_codes');
  },
};