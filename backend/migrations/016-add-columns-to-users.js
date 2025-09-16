export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'login_attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'lock_until', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'login_attempts');
    await queryInterface.removeColumn('users', 'lock_until');
    await queryInterface.removeColumn('users', 'is_active');
    await queryInterface.removeColumn('users', 'phone');
  }