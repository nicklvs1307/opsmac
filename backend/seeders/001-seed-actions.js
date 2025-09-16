export async function up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Clean up existing data
      await queryInterface.bulkDelete("actions", null, { transaction });

      // 2. Seed Actions
      const actionsData = [
        { id: 1, key: "create" },
        { id: 2, key: "read" },
        { id: 3, key: "update" },
        { id: 4, key: "delete" },
        { id: 5, key: "export" },
        { id: 6, key: "approve" },
        { id: 7, key: "manage_permissions" },
      ].map((a) => ({ ...a, created_at: Sequelize.literal('CURRENT_TIMESTAMP'), updated_at: Sequelize.literal('CURRENT_TIMESTAMP') }));
      await queryInterface.bulkInsert("actions", actionsData, { transaction });
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("actions", null, { transaction });
    });
  }