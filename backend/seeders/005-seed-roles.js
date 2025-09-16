export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Clean up existing data
      await queryInterface.bulkDelete("roles", null, { transaction });

      // 2. Seed Roles
      const rolesData = [
        { key: "super_admin", name: "super_admin", is_system: true },
        { key: "owner", name: "owner", is_system: true },
        { key: "manager", name: "manager", is_system: true },
        { key: "waiter", name: "waiter", is_system: true },
      ].map((r) => ({
        ...r,
        id: Sequelize.literal('gen_random_uuid()'),
        created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
        updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
      }));
      await queryInterface.bulkInsert("roles", rolesData, { transaction });
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("roles", null, { transaction });
    });
  }