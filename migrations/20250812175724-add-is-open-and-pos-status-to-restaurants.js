'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('restaurants', 'is_open', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });
    await queryInterface.addColumn('restaurants', 'pos_status', {
      type: Sequelize.ENUM('open', 'closed'),
      defaultValue: 'closed',
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('restaurants', 'pos_status');
    await queryInterface.removeColumn('restaurants', 'is_open');
    // Note: Removing ENUM types is complex and often requires manual SQL
    // or recreating the column. For simplicity, we're just removing the column.
    // In a production environment, you might need to drop the enum type as well
    // if it's no longer used by any other column.
  }
};