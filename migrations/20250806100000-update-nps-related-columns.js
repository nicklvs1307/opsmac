'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add nps_criteria_scores to restaurants table
    const restaurantTable = await queryInterface.describeTable('restaurants');
    if (!restaurantTable.nps_criteria_scores) {
      await queryInterface.addColumn('restaurants', 'nps_criteria_scores', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      });
    }

    // Remove nps_criterion from answers table
    const answersTable = await queryInterface.describeTable('answers');
    if (answersTable.nps_criterion) {
      await queryInterface.removeColumn('answers', 'nps_criterion');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove nps_criteria_scores from restaurants table
    const restaurantTable = await queryInterface.describeTable('restaurants');
    if (restaurantTable.nps_criteria_scores) {
      await queryInterface.removeColumn('restaurants', 'nps_criteria_scores');
    }

    // Add nps_criterion back to answers table (reverting the change)
    const answersTable = await queryInterface.describeTable('answers');
    if (!answersTable.nps_criterion) {
      await queryInterface.addColumn('answers', 'nps_criterion', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  }
};