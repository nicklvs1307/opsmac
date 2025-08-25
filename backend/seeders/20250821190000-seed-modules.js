'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const modulesToSeed = [
      { name: 'fidelity', displayName: 'Fidelidade' },
      { name: 'stock', displayName: 'Estoque' },
      { name: 'orders', displayName: 'Pedidos' },
      { name: 'management', displayName: 'Gestão' },
      { name: 'cdv', displayName: 'CDV' },
      { name: 'financial', displayName: 'Financeiro' },
      { name: 'admin', displayName: 'Administração' }
    ];

    // Explicitly require the models object
    const models = require('../models'); // Path from backend/seeders to backend/models

    for (const moduleData of modulesToSeed) {
      await models.Module.findOrCreate({ // Access Module through the loaded models object
        where: { name: moduleData.name },
        defaults: {
          displayName: moduleData.displayName,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('modules', {
      name: ['fidelity', 'stock', 'orders', 'management', 'cdv', 'financial', 'admin']
    }, {});
  }
};