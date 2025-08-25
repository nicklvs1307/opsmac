'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('production_record_items', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      productionRecordId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'production_records',
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
      quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('input', 'output'),
        allowNull: false,
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

    await queryInterface.addIndex('production_record_items', ['productionRecordId', 'stockableId', 'stockableType'], { unique: true, name: 'production_record_item_unique' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('production_record_items');
  }
};