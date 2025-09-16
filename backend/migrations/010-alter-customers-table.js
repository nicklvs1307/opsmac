export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addConstraint('customers', {
        fields: ['restaurant_id', 'email'],
        type: 'unique',
        name: 'unique_customer_email_per_restaurant'
      }, { transaction });

      await queryInterface.addConstraint('customers', {
        fields: ['restaurant_id', 'phone'],
        type: 'unique',
        name: 'unique_customer_phone_per_restaurant'
      }, { transaction });

      await queryInterface.addColumn('customers', 'loyalty_points', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }, { transaction });
      await queryInterface.addColumn('customers', 'average_rating_given', {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
      }, { transaction });
    });
  }

export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint('customers', 'unique_customer_email_per_restaurant', { transaction });
      await queryInterface.removeConstraint('customers', 'unique_customer_phone_per_restaurant', { transaction });
      await queryInterface.removeColumn('customers', 'average_rating_given', { transaction });
      await queryInterface.removeColumn('customers', 'loyalty_points', { transaction });
    });
  }