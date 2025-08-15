'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('printed_labels', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      labelable_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      labelable_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      print_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expiration_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      quantity_printed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      lot_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sif: {
        type: Sequelize.STRING,
        allowNull: true
      },
      weight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },
      unit_of_measure: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex('printed_labels', ['labelable_id', 'labelable_type']);
    await queryInterface.addIndex('printed_labels', ['expiration_date']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('printed_labels');
  }
};