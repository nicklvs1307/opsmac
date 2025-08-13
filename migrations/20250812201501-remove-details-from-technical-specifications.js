'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('technical_specifications');
    if (columns.details) {
      await queryInterface.removeColumn('technical_specifications', 'details');
    }

  },

  async down (queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('technical_specifications');
    if (!columns.details) {
      await queryInterface.addColumn('technical_specifications', 'details', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });
    }
  }
};