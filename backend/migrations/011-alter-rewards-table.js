export async function up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('rewards');

    if (!tableDefinition.title) {
      await queryInterface.addColumn('rewards', 'title', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDefinition.value) {
      await queryInterface.addColumn('rewards', 'value', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }
    if (!tableDefinition.valid_from) {
      await queryInterface.addColumn('rewards', 'valid_from', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
    if (!tableDefinition.valid_until) {
      await queryInterface.addColumn('rewards', 'valid_until', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
    if (!tableDefinition.total_uses_limit) {
      await queryInterface.addColumn('rewards', 'total_uses_limit', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!tableDefinition.current_uses) {
      await queryInterface.addColumn('rewards', 'current_uses', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
    if (!tableDefinition.max_uses_per_customer) {
      await queryInterface.addColumn('rewards', 'max_uses_per_customer', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!tableDefinition.trigger_conditions) {
      await queryInterface.addColumn('rewards', 'trigger_conditions', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    }
    if (!tableDefinition.wheel_config) {
      await queryInterface.addColumn('rewards', 'wheel_config', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    }
    if (!tableDefinition.analytics) {
      await queryInterface.addColumn('rewards', 'analytics', {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      });
    }
    if (!tableDefinition.coupon_validity_days) {
      await queryInterface.addColumn('rewards', 'coupon_validity_days', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!tableDefinition.days_valid) {
      await queryInterface.addColumn('rewards', 'days_valid', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!tableDefinition.created_by) {
      await queryInterface.addColumn('rewards', 'created_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    if (!tableDefinition.reward_type) {
      await queryInterface.addColumn('rewards', 'reward_type', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'default',
      });
    }

    if (!tableDefinition.customer_id) {
      await queryInterface.addColumn('rewards', 'customer_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    if (!tableDefinition.restaurant_id) {
      await queryInterface.addColumn('rewards', 'restaurant_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rewards', 'restaurant_id');
    await queryInterface.removeColumn('rewards', 'customer_id');
    await queryInterface.removeColumn('rewards', 'reward_type');
    await queryInterface.removeColumn('rewards', 'created_by');
    await queryInterface.removeColumn('rewards', 'days_valid');
    await queryInterface.removeColumn('rewards', 'coupon_validity_days');
    await queryInterface.removeColumn('rewards', 'analytics');
    await queryInterface.removeColumn('rewards', 'wheel_config');
    await queryInterface.removeColumn('rewards', 'trigger_conditions');
    await queryInterface.removeColumn('rewards', 'max_uses_per_customer');
    await queryInterface.removeColumn('rewards', 'current_uses');
    await queryInterface.removeColumn('rewards', 'total_uses_limit');
    await queryInterface.removeColumn('rewards', 'valid_until');
    await queryInterface.removeColumn('rewards', 'valid_from');
    await queryInterface.removeColumn('rewards', 'value');
    await queryInterface.removeColumn('rewards', 'title');
  }