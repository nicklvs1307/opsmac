'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'products',
      'addons',
      {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true, // Allow null if a product doesn't have addons
        defaultValue: [],
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'products',
      'addons'
    );
  }
};