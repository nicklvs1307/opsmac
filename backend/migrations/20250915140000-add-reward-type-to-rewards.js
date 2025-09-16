export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('rewards', 'reward_type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'default', // Ou um valor padrão mais apropriado
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rewards', 'reward_type');
  }
