export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('coupons', 'status', {
      type: Sequelize.ENUM('generated', 'sent', 'redeemed', 'expired', 'cancelled', 'used'),
      allowNull: false,
      defaultValue: 'generated',
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('coupons', 'status');
  }
