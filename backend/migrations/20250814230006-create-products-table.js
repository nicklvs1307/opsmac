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
      restaurantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      isPizza: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      pizzaType: {
        type: Sequelize.ENUM('variable_price', 'fixed_price'),
        allowNull: true,
      },
      availableForDelivery: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      availableForDineIn: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      availableForOnlineOrder: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      availableForDigitalMenu: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      defaultExpirationDays: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      defaultLabelStatus: {
        type: Sequelize.ENUM('RESFRIADO', 'CONGELADO', 'AMBIENTE'),
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