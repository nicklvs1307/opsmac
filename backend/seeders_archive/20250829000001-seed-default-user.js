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

    if (superAdminRole) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('superadmin123', salt);

      await queryInterface.bulkInsert('users', [{
        id: uuidv4(),
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
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
  }
};
