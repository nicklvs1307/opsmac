export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('checkins', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active',
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('checkins', 'status');
  }