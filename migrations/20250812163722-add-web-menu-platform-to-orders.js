'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_orders_platform" ADD VALUE 'web_menu';
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE "orders" SET platform = 'other' WHERE platform = 'web_menu';
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_orders_platform" RENAME TO "enum_orders_platform_old";
      CREATE TYPE "enum_orders_platform" AS ENUM ('ifood', 'delivery_much', 'uai_rango', 'saipos', 'other');
      ALTER TABLE "orders" ALTER COLUMN "platform" TYPE "enum_orders_platform" USING "platform"::text::"enum_orders_platform";
      DROP TYPE "enum_orders_platform_old";
    `);
  }
};