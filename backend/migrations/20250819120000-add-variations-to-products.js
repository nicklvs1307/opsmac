'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'products',
      'variations',
      {
        type: Sequelize.JSONB,
        allowNull: true, // Allow null if a product doesn't have variations
        defaultValue: [],
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'products',
      'variations'
    );
  }
};