'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('feedbacks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      npsScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      feedbackType: {
        type: Sequelize.ENUM('compliment', 'complaint', 'suggestion', 'general'),
        defaultValue: 'general',
      },
      source: {
        type: Sequelize.ENUM('qrcode', 'whatsapp', 'tablet', 'web', 'email', 'manual'),
        allowNull: false,
      },
      tableNumber: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      orderNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      visitDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      categories: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      sentiment: {
        type: Sequelize.ENUM('positive', 'neutral', 'negative'),
        allowNull: true,
      },
      sentimentScore: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
      },
      keywords: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'responded', 'resolved', 'archived'),
        defaultValue: 'pending',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verificationMethod: {
        type: Sequelize.ENUM('email', 'phone', 'receipt', 'none'),
        defaultValue: 'none',
      },
      responseText: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      responseDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      respondedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      followUpRequired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      followUpDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      internalNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
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
    await queryInterface.dropTable('feedbacks');
  }
};