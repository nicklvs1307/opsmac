'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('stocks', 'restaurant_id', {
      type: Sequelize.UUID,
      allowNull: true, // Allow null initially if existing stocks might not have a restaurant_id
      references: {
        model: 'restaurants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('stocks', 'restaurant_id');
  }
};