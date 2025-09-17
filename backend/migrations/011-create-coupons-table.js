export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('coupons', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: Sequelize.TEXT,
    },
    discount_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    discount_value: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    expiration_date: {
      type: Sequelize.DATE,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: Sequelize.ENUM(
        "generated",
        "sent",
        "redeemed",
        "expired",
        "cancelled",
        "used",
      ),
      allowNull: false,
      defaultValue: "generated",
    },
    reward_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'rewards',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    customer_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    restaurant_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    redeemed_at: {
      type: Sequelize.DATE,
    },
    cancelled_at: {
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('coupons');
}
