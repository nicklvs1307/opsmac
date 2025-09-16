export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Product Categories
      await queryInterface.createTable('categories', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        name: { type: Sequelize.STRING, allowNull: false },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      }, { transaction });
      await queryInterface.addConstraint('categories', { fields: ['restaurant_id', 'name'], type: 'unique', name: 'unique_category_name_per_restaurant' }, { transaction });
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('categories', { transaction });
    });
  }