'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('surveys', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'inactive', 'archived'),
        defaultValue: 'draft',
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('delivery_csat', 'menu_feedback', 'customer_profile', 'nps_only', 'performance_review', 'salon_ratings', 'salon_nps', 'delivery_nps', 'salon_csat', 'service_checklist', 'salon_like_dislike', 'custom'),
        allowNull: false,
      },
      restaurantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        }
      },
      rewardId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'rewards',
          key: 'id'
        }
      },
      couponValidityDays: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      rotationGroup: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
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
    await queryInterface.dropTable('surveys');
  }
};