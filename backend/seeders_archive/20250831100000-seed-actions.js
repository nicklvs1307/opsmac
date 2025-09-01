'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const actionsToInsert = [
      { id: 1, key: 'create', created_at: new Date(), updated_at: new Date() },
      { id: 2, key: 'read', created_at: new Date(), updated_at: new Date() },
      { id: 3, key: 'update', created_at: new Date(), updated_at: new Date() },
      { id: 4, key: 'delete', created_at: new Date(), updated_at: new Date() },
      { id: 5, key: 'export', created_at: new Date(), updated_at: new Date() },
      { id: 6, key: 'approve', created_at: new Date(), updated_at: new Date() },
      { id: 7, key: 'manage_permissions', created_at: new Date(), updated_at: new Date() },
    ];

    // Use bulkInsert com a opção de ignorar duplicatas para segurança
    await queryInterface.bulkInsert('actions', actionsToInsert, {
      ignoreDuplicates: true, // Em alguns dialetos SQL, isso pode ser suportado como INSERT IGNORE ou ON CONFLICT DO NOTHING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('actions', null, {});
  }
};
