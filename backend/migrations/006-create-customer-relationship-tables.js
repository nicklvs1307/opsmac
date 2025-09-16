export async function up(queryInterface, Sequelize) {
    // Customer-centric tables
    await queryInterface.createTable('customers', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      birthday: { type: Sequelize.DATEONLY },
      cpf: { type: Sequelize.STRING, unique: true },
      last_visit: { type: Sequelize.DATE },
      total_visits: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_spent: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      segments: { type: Sequelize.JSONB, defaultValue: [] },
      survey_responses_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      loyalty_points: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      average_rating_given: { type: Sequelize.DECIMAL(3, 2), allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addConstraint('customers', {
      fields: ['restaurant_id', 'email'],
      type: 'unique',
      name: 'unique_customer_email_per_restaurant'
    });

    await queryInterface.addConstraint('customers', {
      fields: ['restaurant_id', 'phone'],
      type: 'unique',
      name: 'unique_customer_phone_per_restaurant'
    });

    await queryInterface.createTable('checkins', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      customer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' },
      checkin_time: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      checkout_time: { type: Sequelize.DATE, allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('rewards', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      customer_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'customers', key: 'id' }, onDelete: 'SET NULL' },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      value: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      valid_from: { type: Sequelize.DATE, allowNull: true },
      valid_until: { type: Sequelize.DATE, allowNull: true },
      total_uses_limit: { type: Sequelize.INTEGER, allowNull: true },
      current_uses: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      max_uses_per_customer: { type: Sequelize.INTEGER, allowNull: true },
      trigger_conditions: { type: Sequelize.JSONB, allowNull: true },
      wheel_config: { type: Sequelize.JSONB, allowNull: true },
      analytics: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      coupon_validity_days: { type: Sequelize.INTEGER, allowNull: true },
      days_valid: { type: Sequelize.INTEGER, allowNull: true },
      created_by: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      reward_type: { type: Sequelize.STRING, allowNull: false, defaultValue: 'default' },
      is_redeemed: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // Survey and Feedback ecosystem
    await queryInterface.createTable('nps_criterions', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      name: { type: Sequelize.STRING, allowNull: false },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('questions', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      survey_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'surveys', key: 'id' }, onDelete: 'CASCADE' },
      text: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false }, // e.g., 'rating', 'text', 'multiple_choice'
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('survey_responses', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      survey_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'surveys', key: 'id' }, onDelete: 'CASCADE' },
      customer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      nps_score: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('answers', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      survey_response_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'survey_responses', key: 'id' }, onDelete: 'CASCADE' },
      question_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'questions', key: 'id' }, onDelete: 'CASCADE' },
      value: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('feedbacks', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      customer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      comment: { type: Sequelize.TEXT },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('feedbacks');
    await queryInterface.dropTable('answers');
    await queryInterface.dropTable('survey_responses');
    await queryInterface.dropTable('questions');
    await queryInterface.dropTable('nps_criterions');
    await queryInterface.dropTable('rewards');
    await queryInterface.dropTable('checkins');
    await queryInterface.dropTable('customers');
  }
