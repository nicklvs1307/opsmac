'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ingredients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      unitOfMeasure: {
        type: Sequelize.ENUM('g', 'kg', 'ml', 'L', 'unidade', 'colher de chá', 'colher de sopa', 'xícara', 'pitada', 'a gosto'),
        allowNull: false,
      },
      costPerUnit: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0.0000,
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
    await queryInterface.dropTable('ingredients');
  }
};