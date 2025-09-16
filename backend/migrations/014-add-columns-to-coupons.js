export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('coupons', 'status', {
      type: Sequelize.ENUM('generated', 'sent', 'redeemed', 'expired', 'cancelled', 'used'),
      allowNull: false,
      defaultValue: 'generated',
    });

    await queryInterface.addColumn('coupons', 'redeemed_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('coupons', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('coupons', 'status');
    await queryInterface.removeColumn('coupons', 'redeemed_at');
    await queryInterface.removeColumn('coupons', 'cancelled_at');
  }