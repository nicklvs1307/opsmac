export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('products', 'addons', {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: true, // or false depending on requirements
      }, { transaction });

      await queryInterface.addColumn('products', 'variations', {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: true, // or false depending on requirements
      }, { transaction });
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('products', 'variations', { transaction });
      await queryInterface.removeColumn('products', 'addons', { transaction });
    });
  }