'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('qr_codes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      feedbackUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      shortUrl: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      isGeneric: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      locationDescription: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      area: {
        type: Sequelize.ENUM('indoor', 'outdoor', 'terrace', 'private', 'bar', 'vip'),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('available', 'occupied', 'reserved', 'maintenance', 'inactive'),
        defaultValue: 'available',
      },
      totalScans: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalFeedbacks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastScan: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastFeedback: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      averageRating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      analytics: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      customFields: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      printSettings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
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
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
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
    await queryInterface.dropTable('qr_codes');
  }
};