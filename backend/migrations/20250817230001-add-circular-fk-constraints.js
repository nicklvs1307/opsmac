'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign key for Customer.last_survey_id
    await queryInterface.addConstraint('customers', {
      fields: ['lastSurveyId'],
      type: 'foreign key',
      name: 'fk_customers_last_survey_id',
      references: {
        table: 'surveys',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add foreign key for Reward.customer_id
    await queryInterface.addConstraint('rewards', {
      fields: ['customerId'],
      type: 'foreign key',
      name: 'fk_rewards_customer_id',
      references: {
        table: 'customers',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add foreign key for Survey.reward_id
    await queryInterface.addConstraint('surveys', {
      fields: ['rewardId'],
      type: 'foreign key',
      name: 'fk_surveys_reward_id',
      references: {
        table: 'rewards',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key for Customer.last_survey_id
    await queryInterface.removeConstraint('customers', 'fk_customers_last_survey_id');

    // Remove foreign key for Reward.customer_id
    await queryInterface.removeConstraint('rewards', 'fk_rewards_customer_id');

    // Remove foreign key for Survey.reward_id
    await queryInterface.removeConstraint('surveys', 'fk_surveys_reward_id');
  }
};