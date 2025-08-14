module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('rewards');
    if (!tableExists) {
      await queryInterface.createTable('rewards', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        title: {
          type: Sequelize.STRING(150),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        reward_type: {
          type: Sequelize.ENUM('discount_percentage', 'discount_fixed', 'free_item', 'points', 'cashback', 'gift', 'spin_the_wheel'),
          allowNull: false
        },
        value: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        wheel_config: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        points_required: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 100
        },
        max_uses_per_customer: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        total_uses_limit: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        current_uses: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        minimum_purchase: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        applicable_items: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: true,
          defaultValue: []
        },
        excluded_items: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: true,
          defaultValue: []
        },
        valid_from: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW
        },
        valid_until: {
          type: Sequelize.DATE,
          allowNull: true
        },
        days_valid: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        coupon_validity_days: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        auto_apply: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        requires_approval: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        is_featured: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        image: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        terms_conditions: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        trigger_conditions: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
        },
        notification_settings: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
        },
        analytics: {
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
    await queryInterface.dropTable('rewards');
  },
};