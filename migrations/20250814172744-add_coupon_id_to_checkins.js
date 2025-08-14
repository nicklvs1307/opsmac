'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('checkins', 'coupon_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'coupons',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('checkins', 'coupon_id');
  }
};
