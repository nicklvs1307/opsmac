export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // 1. Clean up existing data
    await queryInterface.bulkDelete("submodules", null, { transaction });

    // 2. Get modules
    const modules = await queryInterface.sequelize.query(
      'SELECT id, key FROM "modules";',
      { type: Sequelize.QueryTypes.SELECT, transaction },
    );
    const moduleMap = modules.reduce((acc, m) => {
      acc[m.key] = m.id;
      return acc;
    }, {});

    // 3. Seed Submodules
    const submodulesData = [
      { module_id: moduleMap["dashboard"], key: "general", name: "Geral" },
      { module_id: moduleMap["fidelity"], key: "general", name: "Geral" },
      { module_id: moduleMap["fidelity"], key: "checkin", name: "Check in" },
      {
        module_id: moduleMap["fidelity"],
        key: "satisfaction",
        name: "Satisfação",
      },
      { module_id: moduleMap["fidelity"], key: "responses", name: "Respostas" },
      {
        module_id: moduleMap["fidelity"],
        key: "relationship",
        name: "Relacionamento",
      },
      { module_id: moduleMap["fidelity"], key: "coupons", name: "Cupons" },
      {
        module_id: moduleMap["fidelity"],
        key: "automation",
        name: "Automação",
      },
      { module_id: moduleMap["stock"], key: "general", name: "Geral" },
      {
        module_id: moduleMap["stock"],
        key: "technical-sheet",
        name: "Ficha Tecnica",
      },
      { module_id: moduleMap["orders"], key: "general", name: "Geral" },
      { module_id: moduleMap["orders"], key: "hall", name: "Salão" },
      { module_id: moduleMap["management"], key: "general", name: "Geral" },
      { module_id: moduleMap["cdv"], key: "general", name: "Geral" },
      { module_id: moduleMap["financial"], key: "general", name: "Geral" },
      {
        module_id: moduleMap["financial"],
        key: "payables",
        name: "Contas a Pagar",
      },
      {
        module_id: moduleMap["financial"],
        key: "cash-flow",
        name: "Fluxo de Caixa",
      },
      { module_id: moduleMap["financial"], key: "dre", name: "DRE" },
      {
        module_id: moduleMap["financial"],
        key: "payments",
        name: "Pagamentos",
      },
      { module_id: moduleMap["financial"], key: "fiscal", name: "Fiscal" },
      { module_id: moduleMap["settings"], key: "general", name: "Geral" },
      { module_id: moduleMap["admin"], key: "users", name: "Usuários" },
      {
        module_id: moduleMap["admin"],
        key: "restaurants",
        name: "Restaurantes",
      },
      { module_id: moduleMap["admin"], key: "permissions", name: "Permissões" },
    ].map((s) => ({
      ...s,
      id: Sequelize.literal("gen_random_uuid()"),
      created_at: Sequelize.literal("CURRENT_TIMESTAMP"),
      updated_at: Sequelize.literal("CURRENT_TIMESTAMP"),
    }));
    await queryInterface.bulkInsert("submodules", submodulesData, {
      transaction,
    });
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkDelete("submodules", null, { transaction });
  });
}
