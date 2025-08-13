'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('restaurants');
    if (!columns.is_open) {
      await queryInterface.addColumn('restaurants', 'is_open', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });
    if (!columns.pos_status) {
      await queryInterface.addColumn('restaurants', 'pos_status', {
      type: Sequelize.ENUM('open', 'closed'),
      defaultValue: 'closed',
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('restaurants');
    if (columns.pos_status) {
      await queryInterface.removeColumn('restaurants', 'pos_status');
    }
    if (columns.is_open) {
      await queryInterface.removeColumn('restaurants', 'is_open');
    }
};