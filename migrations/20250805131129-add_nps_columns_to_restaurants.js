'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('restaurants');
    if (!tableInfo.total_promoters) {
      await queryInterface.addColumn('restaurants', 'total_promoters', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      });
    }
    if (!tableInfo.total_neutrals) {
      await queryInterface.addColumn('restaurants', 'total_neutrals', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      });
    }
    if (!tableInfo.total_detractors) {
      await queryInterface.addColumn('restaurants', 'total_detractors', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      });
    }
    // Esta coluna foi removida em favor de uma tabela dedicada, então não a criamos mais.
    // if (!tableInfo.nps_criteria) {
    //   await queryInterface.addColumn('restaurants', 'nps_criteria', {
    //     type: Sequelize.JSONB,
    //     defaultValue: [],
    //     allowNull: false,
    //   });
    // }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('restaurants', 'total_promoters');
    await queryInterface.removeColumn('restaurants', 'total_neutrals');
    await queryInterface.removeColumn('restaurants', 'total_detractors');
    // await queryInterface.removeColumn('restaurants', 'nps_criteria');
  }
};