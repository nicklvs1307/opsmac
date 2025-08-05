'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('questions');

    if (!tableInfo.nps_criterion_id) {
      await queryInterface.addColumn('questions', 'nps_criterion_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'NpsCriterions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    if (tableInfo.nps_criterion) {
      await queryInterface.removeColumn('questions', 'nps_criterion');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('questions');

    if (!tableInfo.nps_criterion) {
      await queryInterface.addColumn('questions', 'nps_criterion', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (tableInfo.nps_criterion_id) {
      await queryInterface.removeColumn('questions', 'nps_criterion_id');
    }
  }
};