'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('products');
    if (!tableDefinition.category) {
      await queryInterface.addColumn('products', 'category', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('products');
    if (tableDefinition.category) {
      await queryInterface.removeColumn('products', 'category');
    }
  }
};