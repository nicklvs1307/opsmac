'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'surveyResponsesCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true, // Allow null initially, then update existing rows if needed
      comment: 'Total de pesquisas de satisfação respondidas pelo cliente'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'surveyResponsesCount');
  }
};