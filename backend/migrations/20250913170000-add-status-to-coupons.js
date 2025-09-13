'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('coupons', 'status', {
      type: Sequelize.ENUM('generated', 'sent', 'redeemed', 'expired', 'cancelled', 'used'),
      allowNull: false,
      defaultValue: 'generated',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('coupons', 'status');
  }
};
