'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      sku: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_pizza: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      pizza_type: {
        type: Sequelize.ENUM('variable_price', 'fixed_price'),
        allowNull: true,
      },
      available_for_delivery: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      available_for_dine_in: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      available_for_online_order: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      available_for_digital_menu: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      image_url: {
        type: Sequelize.STRING,
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
  }
};