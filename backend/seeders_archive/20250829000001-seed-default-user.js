'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Roles";',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const superAdminRole = roles.find(role => role.name === 'super_admin');

    let defaultRestaurantId = null;

    // 1. Find or create a default restaurant
    let restaurant = await queryInterface.sequelize.query(
      'SELECT id FROM "Restaurants" LIMIT 1;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (restaurant.length === 0) {
      // If no restaurant exists, create a default one
      const newRestaurantId = uuidv4();
      await queryInterface.bulkInsert('Restaurants', [{
        id: newRestaurantId,
        name: 'Default Restaurant',
        address: '123 Main St',
        phone: '555-1234',
        email: 'default@restaurant.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
      defaultRestaurantId = newRestaurantId;
      console.log('Created default restaurant for super admin association.');
    } else {
      defaultRestaurantId = restaurant[0].id;
    }

    if (superAdminRole && defaultRestaurantId) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('superadmin123', salt);

      // Check if super admin user already exists
      let superAdminUser = await queryInterface.sequelize.query(
        'SELECT id FROM "Users" WHERE email = \'admin@example.com\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      let superAdminUserId;
      if (superAdminUser.length === 0) {
        superAdminUserId = uuidv4();
        await queryInterface.bulkInsert('Users', [{
          id: superAdminUserId,
          name: 'Super Admin',
          email: 'admin@example.com',
          password: hashedPassword,
          phone: '123456789',
          roleId: superAdminRole.id,
          isActive: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }], {});
        console.log('Created super admin user.');
      } else {
        superAdminUserId = superAdminUser[0].id;
        console.log('Super admin user already exists.');
      }

      // 3. Associate super admin with the default restaurant in UserRestaurants
      const userRestaurantExists = await queryInterface.sequelize.query(
        `SELECT * FROM "UserRestaurants" WHERE "userId" = '${superAdminUserId}' AND "restaurantId" = '${defaultRestaurantId}';`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (userRestaurantExists.length === 0) {
        await queryInterface.bulkInsert('UserRestaurants', [{
          userId: superAdminUserId,
          restaurantId: defaultRestaurantId,
          isOwner: true, // Super admin is owner of this default restaurant
          createdAt: new Date(),
          updatedAt: new Date()
        }], {});
        console.log('Associated super admin with default restaurant.');
      } else {
        console.log('Super admin already associated with default restaurant.');
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { email: 'admin@example.com' }, {});
    // Optionally, delete the default restaurant if it was created by this seeder
    // This might be tricky if other users are linked to it.
    // For now, we'll leave it.
  }
};