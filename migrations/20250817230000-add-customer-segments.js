'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_customers_customer_segment" ADD VALUE \'promising\';'
    );
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_customers_customer_segment" ADD VALUE \'champion\';'
    );
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_customers_customer_segment" ADD VALUE \'loyal\';'
    );
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_customers_customer_segment" ADD VALUE \'at_risk\';'
    );
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_customers_customer_segment" ADD VALUE \'lost\';'
    );
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_customers_customer_segment" ADD VALUE \'churned_single_purchase\';'
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting enum additions is complex and often not recommended directly in production.
    // It usually involves:
    // 1. Creating a new temporary enum type without the values to be removed.
    // 2. Casting the column to the new temporary type.
    // 3. Dropping the old enum type.
    // 4. Renaming the temporary type to the original name.
    // For simplicity in a 'down' migration, we might just leave them,
    // or if absolutely necessary, handle data migration first.
    // For this exercise, we'll provide a placeholder comment.
    console.log('Reverting enum additions is complex and not directly supported by simple ALTER TYPE DROP VALUE. Manual intervention or a more complex migration strategy might be needed.');
    // Example of a more complex revert (requires careful handling of existing data):
    // await queryInterface.sequelize.query('ALTER TABLE "customers" ALTER COLUMN "customer_segment" DROP DEFAULT;');
    // await queryInterface.sequelize.query('ALTER TABLE "customers" ALTER COLUMN "customer_segment" TYPE VARCHAR USING "customer_segment"::VARCHAR;');
    // await queryInterface.sequelize.query('DROP TYPE "enum_customers_customer_segment";');
    // await queryInterface.sequelize.query('CREATE TYPE "enum_customers_customer_segment" AS ENUM(\'new\', \'regular\', \'vip\', \'inactive\');');
    // await queryInterface.sequelize.query('ALTER TABLE "customers" ALTER COLUMN "customer_segment" TYPE "enum_customers_customer_segment" USING "customer_segment"::text::"enum_customers_customer_segment";');
    // await queryInterface.sequelize.query('ALTER TABLE "customers" ALTER COLUMN "customer_segment" SET DEFAULT \'new\';');
  }
};
