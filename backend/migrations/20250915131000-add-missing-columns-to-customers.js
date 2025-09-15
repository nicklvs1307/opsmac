'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('customers', 'loyalty_points', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('customers', 'average_rating_given', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('customers', 'average_rating_given');
    await queryInterface.removeColumn('customers', 'loyalty_points');
  },
};