'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('products');
    if (!tableExists) {
      await queryInterface.createTable('products', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        sku: { // Stock Keeping Unit (Código de Referência do Estoque)
          type: Sequelize.STRING,
          unique: true
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'restaurants',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
    }
  },

  async down (queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('products');
    if (tableExists) {
      await queryInterface.dropTable('products');
    }
  }
};