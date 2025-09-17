export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // 1. Clean up existing data
    await queryInterface.bulkDelete("modules", null, { transaction });

    // 2. Seed Modules
    const modulesData = [
      { key: "dashboard", name: "Dashboard" },
      { key: "fidelity", name: "Fidelidade" },
      { key: "stock", name: "Estoque" },
      { key: "orders", name: "Pedidos" },
      { key: "management", name: "Gestão" },
      { key: "cdv", name: "CDV" },
      { key: "financial", name: "Financeiro" },
      { key: "settings", name: "Configurações" },
      { key: "admin", name: "Admin" },
    ].map((m) => ({
      ...m,
      id: Sequelize.literal("gen_random_uuid()"),
      created_at: Sequelize.literal("CURRENT_TIMESTAMP"),
      updated_at: Sequelize.literal("CURRENT_TIMESTAMP"),
    }));
    await queryInterface.bulkInsert("modules", modulesData, { transaction });
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkDelete("modules", null, { transaction });
  });
}
