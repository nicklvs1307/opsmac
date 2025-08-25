'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      rewardType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'redeemed', 'expired', 'cancelled'),
        defaultValue: 'active',
      },
      generatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      redeemedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      orderValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      discountApplied: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      redemptionLocation: {
        type: Sequelize.ENUM('online', 'in_store', 'delivery', 'takeout'),
        allowNull: true,
      },
      redemptionMethod: {
        type: Sequelize.ENUM('qrcode', 'manual', 'pos_system', 'app'),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      qrCodeData: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notificationSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      notificationSentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      reminderSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      reminderSentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      visitMilestone: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      rewardId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'rewards',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      redeemedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('coupons');
  }
};