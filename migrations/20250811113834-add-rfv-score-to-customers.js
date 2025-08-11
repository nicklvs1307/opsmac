'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'rfv_score', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {
        recency: null,
        frequency: null,
        monetary: null
      },
      comment: 'Pontuação RFV (Recência, Frequência, Valor)'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'rfv_score');
  }
};