export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('coupons', 'status', {
        type: Sequelize.ENUM('generated', 'sent', 'redeemed', 'expired', 'cancelled', 'used'),
        allowNull: false,
        defaultValue: 'generated',
      }, { transaction });

      await queryInterface.addColumn('coupons', 'redeemed_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });
      await queryInterface.addColumn('coupons', 'cancelled_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('coupons', 'status', { transaction });
      await queryInterface.removeColumn('coupons', 'redeemed_at', { transaction });
      await queryInterface.removeColumn('coupons', 'cancelled_at', { transaction });
    });
  }