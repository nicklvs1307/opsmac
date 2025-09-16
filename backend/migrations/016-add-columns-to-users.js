export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('users', 'login_attempts', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.addColumn('users', 'lock_until', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('users', 'is_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }, { transaction });

      await queryInterface.addColumn('users', 'phone', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('users', 'login_attempts', { transaction });
      await queryInterface.removeColumn('users', 'lock_until', { transaction });
      await queryInterface.removeColumn('users', 'is_active', { transaction });
      await queryInterface.removeColumn('users', 'phone', { transaction });
    });
  }