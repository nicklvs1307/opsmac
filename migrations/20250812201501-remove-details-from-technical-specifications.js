'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('technical_specifications', 'details');
  },

  async down (queryInterface, Sequelize) {
    // Re-add the 'details' column if rolling back
    await queryInterface.addColumn('technical_specifications', 'details', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });
  }
};