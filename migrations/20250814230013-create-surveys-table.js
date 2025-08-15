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
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reward_id: {
        type: Sequelize.UUID,
        allowNull: true,
        // Temporarily remove references to rewards due to circular dependency
        // references: {
        //   model: 'rewards',
        //   key: 'id'
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL',
      },
      coupon_validity_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      rotation_group: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('surveys');
  }
};