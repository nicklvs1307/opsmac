export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Create customer_segments table
      await queryInterface.createTable('customer_segments', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT },
        rules: { type: Sequelize.JSONB, defaultValue: [] },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });

      // Create campaigns table
      await queryInterface.createTable('campaigns', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT },
        type: { type: Sequelize.STRING, allowNull: false },
        status: { type: Sequelize.STRING, defaultValue: 'draft' },
        scheduled_at: { type: Sequelize.DATE },
        sent_at: { type: Sequelize.DATE },
        segment_id: { type: Sequelize.UUID, references: { model: 'customer_segments', key: 'id' }, onDelete: 'SET NULL' },
        message_content: { type: Sequelize.JSONB, allowNull: false },
        created_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
        stats: { type: Sequelize.JSONB, defaultValue: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });

      // Create goals table
      await queryInterface.createTable('goals', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT },
        target_value: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        current_value: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
        metric: { type: Sequelize.STRING, allowNull: false },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        end_date: { type: Sequelize.DATEONLY, allowNull: false },
        status: { type: Sequelize.STRING, defaultValue: 'active' },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });

      // Create survey_reward_programs table
      await queryInterface.createTable('survey_reward_programs', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
        rewards_per_response: { type: Sequelize.JSONB, defaultValue: [] },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('campaigns', { transaction });
      await queryInterface.dropTable('customer_segments', { transaction });
      await queryInterface.dropTable('goals', { transaction });
      await queryInterface.dropTable('survey_reward_programs', { transaction });
    });
  }