'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('customers', 'restaurant_id', {
      type: Sequelize.UUID,
      allowNull: true, // Temporarily allow null, will be updated later
      references: {
        model: 'restaurants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('customers', 'restaurant_id');
  }
};