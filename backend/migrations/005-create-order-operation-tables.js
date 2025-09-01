'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Product Categories
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      name: { type: Sequelize.STRING, allowNull: false },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
    await queryInterface.addConstraint('categories', { fields: ['restaurant_id', 'name'], type: 'unique', name: 'unique_category_name_per_restaurant' });

    // Tables and Operations
    await queryInterface.createTable('tables', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      table_number: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
    await queryInterface.addConstraint('tables', { fields: ['restaurant_id', 'table_number'], type: 'unique', name: 'unique_table_number_per_restaurant' });

    await queryInterface.createTable('qrcodes', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        table_id: { type: Sequelize.UUID, references: { model: 'tables', key: 'id' }, onDelete: 'CASCADE' },
        url: { type: Sequelize.STRING, allowNull: false },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('table_sessions', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        table_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'tables', key: 'id' }, onDelete: 'CASCADE' },
        customer_id: { type: Sequelize.UUID, references: { model: 'customers', key: 'id' } },
        start_time: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
        end_time: { type: Sequelize.DATE },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });

    // Orders and related entities
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      customer_id: { type: Sequelize.UUID, references: { model: 'customers', key: 'id' }, onDelete: 'SET NULL' },
      table_id: { type: Sequelize.UUID, references: { model: 'tables', key: 'id' }, onDelete: 'SET NULL' },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' }, // e.g., pending, confirmed, preparing, ready, delivered, canceled
      items: { type: Sequelize.JSONB, allowNull: false },
      restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('coupons', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        code: { type: Sequelize.STRING, allowNull: false, unique: true },
        description: { type: Sequelize.TEXT },
        discount_type: { type: Sequelize.STRING, allowNull: false }, // 'percentage' or 'fixed'
        discount_value: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        expiration_date: { type: Sequelize.DATE },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('addons', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        name: { type: Sequelize.STRING, allowNull: false },
        price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });

    // Communication
    await queryInterface.createTable('waiter_calls', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        table_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'tables', key: 'id' } },
        status: { type: Sequelize.STRING, defaultValue: 'pending' }, // pending, acknowledged, resolved
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('whatsapp_messages', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        customer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'customers', key: 'id' } },
        message: { type: Sequelize.TEXT, allowNull: false },
        status: { type: Sequelize.STRING, allowNull: false }, // e.g., 'sent', 'delivered', 'failed'
        sent_at: { type: Sequelize.DATE },
        restaurant_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('whatsapp_messages');
    await queryInterface.dropTable('waiter_calls');
    await queryInterface.dropTable('addons');
    await queryInterface.dropTable('coupons');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('table_sessions');
    await queryInterface.dropTable('qrcodes');
    await queryInterface.dropTable('tables');
    await queryInterface.dropTable('categories');
  }
};
