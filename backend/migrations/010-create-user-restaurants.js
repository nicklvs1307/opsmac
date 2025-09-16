export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_restaurants', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'restaurants', key: 'id' },
        onDelete: 'CASCADE',
      },
      is_owner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addConstraint('user_restaurants', {
      fields: ['user_id', 'restaurant_id'],
      type: 'primary key',
      name: 'user_restaurant_pk'
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_restaurants');
  }