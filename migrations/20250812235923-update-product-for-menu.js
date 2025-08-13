'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'category_id', {
      type: Sequelize.UUID,
      allowNull: true, // Temporarily allow null, will be updated later if needed
      references: {
        model: 'Categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // If category is deleted, set category_id to null
    });

    await queryInterface.addColumn('products', 'is_pizza', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('products', 'pizza_type', {
      type: Sequelize.ENUM('variable_price', 'fixed_price'),
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'available_for_delivery', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });

    await queryInterface.addColumn('products', 'available_for_dine_in', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });

    await queryInterface.addColumn('products', 'available_for_online_order', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });

    await queryInterface.addColumn('products', 'available_for_digital_menu', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });

    await queryInterface.addColumn('products', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'image_url');
    await queryInterface.removeColumn('products', 'available_for_digital_menu');
    await queryInterface.removeColumn('products', 'available_for_online_order');
    await queryInterface.removeColumn('products', 'available_for_dine_in');
    await queryInterface.removeColumn('products', 'available_for_delivery');
    await queryInterface.removeColumn('products', 'pizza_type');
    await queryInterface.removeColumn('products', 'is_pizza');
    await queryInterface.removeColumn('products', 'category_id');
  },
};