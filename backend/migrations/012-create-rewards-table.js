export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('rewards', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    customer_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'customers', key: 'id' }, // Assuming a 'customers' table exists
      onDelete: 'SET NULL',
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    is_redeemed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    reward_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    restaurant_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'restaurants', key: 'id' },
      onDelete: 'CASCADE',
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    value: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    valid_from: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    valid_until: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    total_uses_limit: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    current_uses: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    max_uses_per_customer: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    trigger_conditions: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    wheel_config: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    analytics: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    coupon_validity_days: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    days_valid: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    created_by: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' }, // Assuming a 'users' table exists
      onDelete: 'SET NULL',
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('rewards');
}
