export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'phone');
  }
