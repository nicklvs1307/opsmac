'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'addons', {
      type: Sequelize.JSONB,
      defaultValue: [],
      allowNull: true, // or false depending on requirements
    });

    await queryInterface.addColumn('products', 'variations', {
      type: Sequelize.JSONB,
      defaultValue: [],
      allowNull: true, // or false depending on requirements
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'variations');
    await queryInterface.removeColumn('products', 'addons');
  }
};
