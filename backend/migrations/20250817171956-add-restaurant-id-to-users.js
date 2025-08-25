'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'restaurantId', {
      type: Sequelize.UUID,
      references: {
        model: 'restaurants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true // Permite nulo para usuários que não são de restaurante (ex: super_admin)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'restaurantId');
  }
};