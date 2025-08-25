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
      labelableId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      labelableType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
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
      printDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      expirationDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      quantityPrinted: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      lotNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sif: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      weight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      },
      unitOfMeasure: {
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

    await queryInterface.addIndex('printed_labels', ['labelableId', 'labelableType']);
    await queryInterface.addIndex('printed_labels', ['expirationDate']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('printed_labels');
  }
};