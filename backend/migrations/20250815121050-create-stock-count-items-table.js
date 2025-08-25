'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_count_items', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      stockCountId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'stock_counts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      stockableId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      stockableType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      systemQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      countedQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      discrepancy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('stock_count_items', ['stockCountId', 'stockableId', 'stockableType'], { unique: true, name: 'stock_count_item_unique' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_count_items');
  }
};