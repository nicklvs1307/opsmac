'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      cpf: {
        type: Sequelize.STRING(11),
        allowNull: true,
        unique: true,
      },
      whatsapp: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      birthDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      preferences: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      loyaltyPoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalVisits: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalSpent: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      averageRatingGiven: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      lastVisit: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      firstVisit: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      customerSegment: {
        type: Sequelize.ENUM('new', 'regular', 'vip', 'inactive'),
        defaultValue: 'new',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'blocked'),
        defaultValue: 'active',
      },
      source: {
        type: Sequelize.ENUM('qrcode', 'whatsapp', 'tablet', 'web', 'referral', 'social_media', 'checkin_qrcode'),
        allowNull: true,
      },
      referralCode: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      referredBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      marketingConsent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      phoneVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      gdprConsent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      gdprConsentDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastBirthdayMessageYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
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
    await queryInterface.dropTable('customers');
  }
};