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
      stock_count_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'stock_counts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stockable_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      stockable_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      system_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      counted_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      discrepancy: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('stock_count_items', ['stock_count_id', 'stockable_id', 'stockable_type'], { unique: true, name: 'stock_count_item_unique' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_count_items');
  }
};