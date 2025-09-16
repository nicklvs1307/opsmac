export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Payment Methods
      await queryInterface.createTable('payment_methods', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        name: { type: Sequelize.STRING, allowNull: false },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });

      // Financial Categories (for general transactions)
      await queryInterface.createTable('financial_categories', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        name: { type: Sequelize.STRING, allowNull: false },
        type: { type: Sequelize.STRING, allowNull: false }, // 'income' or 'expense'
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });

      // Financial Transactions
      await queryInterface.createTable('financial_transactions', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        description: { type: Sequelize.STRING, allowNull: false },
        amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        type: { type: Sequelize.STRING, allowNull: false }, // 'income' or 'expense'
        category_id: { type: Sequelize.UUID, references: { model: 'financial_categories', key: 'id' }, onDelete: 'SET NULL' },
        payment_method_id: { type: Sequelize.UUID, references: { model: 'payment_methods', key: 'id' }, onDelete: 'SET NULL' },
        transaction_date: { type: Sequelize.DATE, allowNull: false },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
        user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });

      // Cash Register
      await queryInterface.createTable('cash_register_categories', {
          id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
          name: { type: Sequelize.STRING, allowNull: false },
          restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
          created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
          updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });

      await queryInterface.createTable('cash_register_sessions', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        opening_balance: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        closing_balance: { type: Sequelize.DECIMAL(10, 2) },
        opened_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        closed_at: { type: Sequelize.DATE },
        user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'NO ACTION' },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });

      await queryInterface.createTable('cash_register_movements', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        session_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'cash_register_sessions', key: 'id' }, onDelete: 'CASCADE' },
        type: { type: Sequelize.STRING, allowNull: false }, // 'in' or 'out'
        amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        description: { type: Sequelize.STRING, allowNull: false },
        category_id: { type: Sequelize.UUID, references: { model: 'cash_register_categories', key: 'id' } },
        user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'NO ACTION' },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('cash_register_movements', { transaction });
      await queryInterface.dropTable('cash_register_sessions', { transaction });
      await queryInterface.dropTable('cash_register_categories', { transaction });
      await queryInterface.dropTable('financial_transactions', { transaction });
      await queryInterface.dropTable('financial_categories', { transaction });
      await queryInterface.dropTable('payment_methods', { transaction });
    });
  }
