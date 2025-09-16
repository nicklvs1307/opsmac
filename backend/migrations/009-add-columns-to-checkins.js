export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('checkins', 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      }, { transaction });

      await queryInterface.addColumn('checkins', 'checkin_time', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }, { transaction });
      await queryInterface.addColumn('checkins', 'checkout_time', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });
      await queryInterface.addColumn('checkins', 'expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('checkins', 'status', { transaction });
      await queryInterface.removeColumn('checkins', 'expires_at', { transaction });
      await queryInterface.removeColumn('checkins', 'checkout_time', { transaction });
      await queryInterface.removeColumn('checkins', 'checkin_time', { transaction });
    });
  }