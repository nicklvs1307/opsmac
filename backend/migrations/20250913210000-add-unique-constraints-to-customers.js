'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('customers', {
      fields: ['restaurant_id', 'email'],
      type: 'unique',
      name: 'unique_customer_email_per_restaurant'
    });

    await queryInterface.addConstraint('customers', {
      fields: ['restaurant_id', 'phone'],
      type: 'unique',
      name: 'unique_customer_phone_per_restaurant'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('customers', 'unique_customer_email_per_restaurant');
    await queryInterface.removeConstraint('customers', 'unique_customer_phone_per_restaurant');
  }
};