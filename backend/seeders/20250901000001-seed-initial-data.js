'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Actions
    const actions = [
      { id: 1, key: 'create', created_at: new Date(), updated_at: new Date() },
      { id: 2, key: 'read', created_at: new Date(), updated_at: new Date() },
      { id: 3, key: 'update', created_at: new Date(), updated_at: new Date() },
      { id: 4, key: 'delete', created_at: new Date(), updated_at: new Date() },
      { id: 5, key: 'export', created_at: new Date(), updated_at: new Date() },
      { id: 6, key: 'approve', created_at: new Date(), updated_at: new Date() },
      { id: 7, key: 'manage_permissions', created_at: new Date(), updated_at: new Date() },
    ];
    await queryInterface.bulkInsert('actions', actions, {});

    // Super Admin User
    const superAdminId = uuidv4();
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('superadmin', salt);

    await queryInterface.bulkInsert('users', [{
      id: superAdminId,
      email: 'superadmin@example.com',
      name: 'Super Admin',
      password_hash: hashedPassword,
      is_superadmin: true,
      created_at: new Date(),
      updated_at: new Date(),
    }], {});

    // Default Restaurant (Tenant)
    const restaurantId = uuidv4();
    await queryInterface.bulkInsert('restaurants', [{
        id: restaurantId,
        name: 'Restaurante Padrão',
        address: 'Rua Padrão, 123',
        city: 'Cidade Padrão',
        state: 'SP',
        createdAt: new Date(),
        updatedAt: new Date(),
    }], {});

    // Link Super Admin to Default Restaurant as Owner
    await queryInterface.bulkInsert('user_restaurants', [{
        user_id: superAdminId,
        restaurant_id: restaurantId,
        is_owner: true,
        created_at: new Date(),
        updated_at: new Date(),
    }], {});

    // TODO: Add more seed data (modules, features, roles, etc.)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_restaurants', null, {});
    await queryInterface.bulkDelete('restaurants', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('actions', null, {});
  }
};
