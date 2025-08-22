'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Modules', [
      {
        name: 'fidelity',
        displayName: 'Fidelidade',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'stock',
        displayName: 'Estoque',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'orders',
        displayName: 'Pedidos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'management',
        displayName: 'Gestão',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'cdv',
        displayName: 'CDV',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'financial',
        displayName: 'Financeiro',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Modules', null, {});
  }
};
