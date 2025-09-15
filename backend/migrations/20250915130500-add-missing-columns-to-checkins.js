'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('checkins', 'expires_at');
    await queryInterface.removeColumn('checkins', 'checkout_time');
    await queryInterface.removeColumn('checkins', 'checkin_time');
  },
};