module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('surveys');
    if (!tableExists) {
      await queryInterface.createTable('surveys', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
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
          allowNull: true,
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
            references: {
                model: 'rewards',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
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
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('surveys');
  },
};