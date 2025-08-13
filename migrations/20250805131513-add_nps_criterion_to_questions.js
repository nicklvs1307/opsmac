'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('questions');
    if (!tableInfo.nps_criterion) {
      await queryInterface.addColumn('questions', 'nps_criterion', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('questions');
    if (columns.nps_criterion) {
      await queryInterface.removeColumn('questions', 'nps_criterion');
    }
};