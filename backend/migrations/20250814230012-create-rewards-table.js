'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rewards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      rewardType: {
        type: Sequelize.ENUM('discount_percentage', 'discount_fixed', 'free_item', 'points', 'cashback', 'gift', 'spin_the_wheel'),
        allowNull: false,
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      wheelConfig: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      pointsRequired: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 100,
      },
      maxUsesPerCustomer: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      totalUsesLimit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      currentUses: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      minimumPurchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      applicableItems: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      excludedItems: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      validFrom: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      validUntil: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      daysValid: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      couponValidityDays: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      autoApply: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      requiresApproval: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      image: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      termsConditions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      triggerConditions: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          min_rating: null,
          feedback_type: null,
          visit_count: null,
          total_spent: null,
          customer_segment: null,
          special_occasions: []
        },
      },
      notificationSettings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          send_email: true,
          send_whatsapp: false,
          send_push: false,
          custom_message: ''
        },
      },
      analytics: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          total_generated: 0,
          total_redeemed: 0,
          redemption_rate: 0,
          average_order_value: 0,
          customer_satisfaction: 0
        },
      },
      restaurantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: true,
        // Temporarily remove references to customers due to circular dependency
        // references: {
        //   model: 'customers',
        //   key: 'id'
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL',
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('rewards');
  }
};