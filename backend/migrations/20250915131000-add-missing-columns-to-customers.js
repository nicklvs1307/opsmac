export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'loyalty_points', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('customers', 'average_rating_given', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'average_rating_given');
    await queryInterface.removeColumn('customers', 'loyalty_points');
  }