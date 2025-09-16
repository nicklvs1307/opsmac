export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('checkins', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active',
    });

    await queryInterface.addColumn('checkins', 'checkin_time', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
    await queryInterface.addColumn('checkins', 'checkout_time', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('checkins', 'expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('checkins', 'status');
    await queryInterface.removeColumn('checkins', 'expires_at');
    await queryInterface.removeColumn('checkins', 'checkout_time');
    await queryInterface.removeColumn('checkins', 'checkin_time');
  }