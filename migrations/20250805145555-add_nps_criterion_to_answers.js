'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('answers');
    // Esta coluna também foi depreciada em favor da nps_criterion_id na tabela de perguntas.
    // Não vamos mais criar esta coluna.
    // if (!tableInfo.nps_criterion) {
    //   await queryInterface.addColumn('answers', 'nps_criterion', {
    //     type: Sequelize.STRING,
    //     allowNull: true,
    //   });
    // }
  },

  async down (queryInterface, Sequelize) {
    // await queryInterface.removeColumn('answers', 'nps_criterion');
  }
};