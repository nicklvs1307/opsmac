export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
    const tableDefinition = await queryInterface.describeTable('rewards');

    if (!tableDefinition.title) {
      await queryInterface.addColumn('rewards', 'title', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });
    }
    if (!tableDefinition.value) {
      await queryInterface.addColumn('rewards', 'value', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }, { transaction });
    }
    if (!tableDefinition.valid_from) {
      await queryInterface.addColumn('rewards', 'valid_from', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });
    }
    if (!tableDefinition.valid_until) {
      await queryInterface.addColumn('rewards', 'valid_until', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });
    }
    if (!tableDefinition.total_uses_limit) {
      await queryInterface.addColumn('rewards', 'total_uses_limit', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });
    }
    if (!tableDefinition.current_uses) {
      await queryInterface.addColumn('rewards', 'current_uses', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }, { transaction });
    }
    if (!tableDefinition.max_uses_per_customer) {
      await queryInterface.addColumn('rewards', 'max_uses_per_customer', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });
    }
    if (!tableDefinition.trigger_conditions) {
      await queryInterface.addColumn('rewards', 'trigger_conditions', {
        type: Sequelize.JSONB,
        allowNull: true,
      }, { transaction });
    }
    if (!tableDefinition.wheel_config) {
      await queryInterface.addColumn('rewards', 'wheel_config', {
        type: Sequelize.JSONB,
        allowNull: true,
      }, { transaction });
    }
    if (!tableDefinition.analytics) {
      await queryInterface.addColumn('rewards', 'analytics', {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      }, { transaction });
    }
    if (!tableDefinition.coupon_validity_days) {
      await queryInterface.addColumn('rewards', 'coupon_validity_days', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });
    }
    if (!tableDefinition.days_valid) {
      await queryInterface.addColumn('rewards', 'days_valid', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });
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
      }, { transaction });
    }

    if (!tableDefinition.reward_type) {
      await queryInterface.addColumn('rewards', 'reward_type', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'default',
      }, { transaction });
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
      }, { transaction });
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
      }, { transaction });
    }
  });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('rewards', 'restaurant_id', { transaction });
      await queryInterface.removeColumn('rewards', 'customer_id', { transaction });
      await queryInterface.removeColumn('rewards', 'reward_type', { transaction });
      await queryInterface.removeColumn('rewards', 'created_by', { transaction });
      await queryInterface.removeColumn('rewards', 'days_valid', { transaction });
      await queryInterface.removeColumn('rewards', 'coupon_validity_days', { transaction });
      await queryInterface.removeColumn('rewards', 'analytics', { transaction });
      await queryInterface.removeColumn('rewards', 'wheel_config', { transaction });
      await queryInterface.removeColumn('rewards', 'trigger_conditions', { transaction });
      await queryInterface.removeColumn('rewards', 'max_uses_per_customer', { transaction });
      await queryInterface.removeColumn('rewards', 'current_uses', { transaction });
      await queryInterface.removeColumn('rewards', 'total_uses_limit', { transaction });
      await queryInterface.removeColumn('rewards', 'valid_until', { transaction });
      await queryInterface.removeColumn('rewards', 'valid_from', { transaction });
      await queryInterface.removeColumn('rewards', 'value', { transaction });
      await queryInterface.removeColumn('rewards', 'title', { transaction });
    });
  }