module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('coupons');
    if (!tableExists) {
      await queryInterface.createTable('coupons', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
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
        reward_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM('active', 'redeemed', 'expired', 'cancelled'),
          defaultValue: 'active'
        },
        generated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        redeemed_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        cancelled_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        order_value: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        discount_applied: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        redemption_location: {
          type: Sequelize.ENUM('online', 'in_store', 'delivery', 'takeout'),
          allowNull: true
        },
        redemption_method: {
          type: Sequelize.ENUM('qrcode', 'manual', 'pos_system', 'app'),
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
        },
        qr_code_data: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        notification_sent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        notification_sent_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        reminder_sent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        reminder_sent_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        visit_milestone: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        reward_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'rewards',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        customer_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'customers',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
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
        redeemed_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
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
    await queryInterface.dropTable('coupons');
  },
};