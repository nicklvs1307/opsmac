'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
      customerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      externalOrderId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      platform: {
        type: Sequelize.ENUM('ifood', 'delivery_much', 'uai_rango', 'saipos', 'other'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled', 'concluded', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      deliveryFee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      customerDetails: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      orderDetails: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      orderDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deliveryAddress: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deliveryType: {
        type: Sequelize.ENUM('delivery', 'pickup', 'dine_in'),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('orders');
  }
};