'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Clean up existing data
    await queryInterface.bulkDelete('user_restaurants', null, {});
    await queryInterface.bulkDelete('restaurants', null, {});
    await queryInterface.bulkDelete('users', null, {});

    // --- Seed Super Admin User ---
    const superAdminId = uuidv4();
    const salt = await bcrypt.genSalt(12);
    // Using a more secure default password
    const hashedPassword = await bcrypt.hash('superadmin@123', salt);

    await queryInterface.bulkInsert('users', [{
      id: superAdminId,
      email: 'superadmin@example.com',
      name: 'Super Admin',
      password_hash: hashedPassword,
      is_superadmin: true,
      created_at: new Date(),
      updated_at: new Date(),
    }], {});

    // --- Seed Default Restaurant (Tenant) ---
    const restaurantId = uuidv4();
    await queryInterface.bulkInsert('restaurants', [{
        id: restaurantId,
        name: 'Restaurante Padrão',
        slug: 'restaurante-padrao',
        address: 'Rua Padrão, 123',
        city: 'Cidade Padrão',
        state: 'SP',
        createdAt: new Date(),
        updatedAt: new Date(),
    }], {});

    // --- Link Super Admin to Default Restaurant as Owner ---
    await queryInterface.bulkInsert('user_restaurants', [{
        user_id: superAdminId,
        restaurant_id: restaurantId,
        is_owner: true,
        created_at: new Date(),
        updated_at: new Date(),
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_restaurants', null, {});
    await queryInterface.bulkDelete('restaurants', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
