'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      external_order_id: {
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
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      delivery_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      customer_details: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      order_details: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      order_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      delivery_address: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      delivery_type: {
        type: Sequelize.ENUM('delivery', 'pickup', 'dine_in'),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};
