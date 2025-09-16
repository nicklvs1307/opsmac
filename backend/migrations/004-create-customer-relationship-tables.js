export async function up(queryInterface, Sequelize) {
    // Customer-centric tables
    await queryInterface.createTable('customers', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, unique: true },
      phone: { type: Sequelize.STRING },
      birthday: { type: Sequelize.DATEONLY },
      cpf: { type: Sequelize.STRING, unique: true },
      last_visit: { type: Sequelize.DATE },
      total_visits: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_spent: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      segments: { type: Sequelize.JSONB, defaultValue: [] },
      survey_responses_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('checkins', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      customer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('rewards', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      customer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      description: { type: Sequelize.TEXT, allowNull: false },
      is_redeemed: { type: Sequelize.BOOLEAN, defaultValue: false },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
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
