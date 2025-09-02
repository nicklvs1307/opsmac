
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Clean up existing data
    // Note: The table name for Role-Feature links might be RoleFeatures, RolePermissions, or similar.
    // I will assume a generic name and you might need to adjust if your migration created a different one.
    try {
      await queryInterface.bulkDelete('RoleFeatures', null, {});
    } catch (e) {
      // Attempt with another common name if the first fails
      await queryInterface.bulkDelete('RolePermission', null, {});
    }
    await queryInterface.bulkDelete('Features', null, {});
    await queryInterface.bulkDelete('Submodules', null, {});
    await queryInterface.bulkDelete('modules', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.bulkDelete('actions', null, {});

    // 2. Seed Actions
    const actions = [
      { id: 1, key: 'create', created_at: new Date(), updated_at: new Date() },
      { id: 2, key: 'read', created_at: new Date(), updated_at: new Date() },
      { id: 3, key: 'update', created_at: new Date(), updated_at: new Date() },
      { id: 4, key: 'delete', created_at: new Date(), updated_at: new Date() },
      { id: 5, key: 'export', created_at: new Date(), updated_at: new Date() },
      { id: 6, key: 'approve', created_at: new Date(), updated_at: new Date() },
      { id: 7, key: 'manage_permissions', created_at: new Date(), updated_at: new Date() },
    ];
    await queryInterface.bulkInsert('actions', actions, {});

    // 3. Seed Modules, Submodules, and Features
    const modulesToInsert = [
      { name: 'fidelity', displayName: 'Fidelidade', createdAt: new Date(), updatedAt: new Date() },
      { name: 'stock', displayName: 'Estoque', createdAt: new Date(), updatedAt: new Date() },
      { name: 'orders', displayName: 'Pedidos', createdAt: new Date(), updatedAt: new Date() },
      { name: 'management', displayName: 'Gestão', createdAt: new Date(), updatedAt: new Date() },
      { name: 'cdv', displayName: 'CDV', createdAt: new Date(), updatedAt: new Date() },
      { name: 'financial', displayName: 'Financeiro', createdAt: new Date(), updatedAt: new Date() },
      { name: 'settings', displayName: 'Configurações', createdAt: new Date(), updatedAt: new Date() },
      { name: 'admin', displayName: 'Admin', createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('modules', modulesToInsert, {});
    const modules = await queryInterface.sequelize.query('SELECT id, name FROM "modules";', { type: queryInterface.sequelize.QueryTypes.SELECT });
    const moduleMap = modules.reduce((acc, module) => { acc[module.name] = module.id; return acc; }, {});

    const submodulesToInsert = [
      { name: 'general', displayName: 'Geral', moduleId: moduleMap['fidelity'] },
      { name: 'checkin', displayName: 'Check in', moduleId: moduleMap['fidelity'] },
      { name: 'satisfaction', displayName: 'Satisfação', moduleId: moduleMap['fidelity'] },
      { name: 'responses', displayName: 'Respostas', moduleId: moduleMap['fidelity'] },
      { name: 'relationship', displayName: 'Relacionamento', moduleId: moduleMap['fidelity'] },
      { name: 'coupons', displayName: 'Cupons', moduleId: moduleMap['fidelity'] },
      { name: 'automation', displayName: 'Automação', moduleId: moduleMap['fidelity'] },
      { name: 'technical-sheet', displayName: 'Ficha Tecnica', moduleId: moduleMap['stock'] },
      { name: 'hall', displayName: 'Salão', moduleId: moduleMap['orders'] },
      { name: 'payables', displayName: 'Contas a Pagar', moduleId: moduleMap['financial'] },
      { name: 'cash-flow', displayName: 'Fluxo de Caixa', moduleId: moduleMap['financial'] },
      { name: 'dre', displayName: 'DRE', moduleId: moduleMap['financial'] },
      { name: 'payments', displayName: 'Pagamentos', moduleId: moduleMap['financial'] },
      { name: 'fiscal', displayName: 'Fiscal', moduleId: moduleMap['financial'] },
      { name: 'users', displayName: 'Usuários', moduleId: moduleMap['admin'] },
      { name: 'restaurants', displayName: 'Restaurantes', moduleId: moduleMap['admin'] },
      { name: 'permissions', displayName: 'Permissões', moduleId: moduleMap['admin'] },
    ].map(s => ({ ...s, createdAt: new Date(), updatedAt: new Date() }));
    await queryInterface.bulkInsert('Submodules', submodulesToInsert, {});
    const submodules = await queryInterface.sequelize.query(`SELECT s.id, s.name, m.name as "moduleName" FROM "Submodules" s JOIN "modules" m ON s."moduleId" = m.id;`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    const getSubmoduleId = (moduleName, submoduleName) => submodules.find(s => s.moduleName === moduleName && s.name === submoduleName)?.id || null;

    const featuresToInsert = [ /* PASTE FULL featuresToInsert ARRAY HERE */ ].map(f => ({ ...f, createdAt: new Date(), updatedAt: new Date() }));
    await queryInterface.bulkInsert('Features', featuresToInsert, {});

    // 4. Seed Roles and Permissions
    const rolesToInsert = [
      { name: 'super_admin', description: 'Acesso total ao sistema.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
      { name: 'owner', description: 'Proprietário do restaurante.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
      { name: 'manager', description: 'Gerente do restaurante.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
      { name: 'waiter', description: 'Garçom.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
    ];
    await queryInterface.bulkInsert('Roles', rolesToInsert, {});

    const allRoles = await queryInterface.sequelize.query(`SELECT id, name from "Roles"`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    const allFeatures = await queryInterface.sequelize.query(`SELECT id, name from "Features"`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    const roleMap = allRoles[0].reduce((acc, role) => { acc[role.name] = role.id; return acc; }, {});
    const featureMap = allFeatures[0].reduce((acc, feature) => { acc[feature.name] = feature.id; return acc; }, {});

    const roleFeatures = [ /* PASTE FULL roleFeatures ARRAY LOGIC HERE */ ];
    await queryInterface.bulkInsert('RoleFeatures', roleFeatures, {});

    // 5. Populate Feature Paths
    const pathMap = { /* PASTE FULL pathMap OBJECT HERE */ };
    for (const featureName in pathMap) {
      await queryInterface.sequelize.query('UPDATE "Features" SET path = :path WHERE name = :featureName', {
        replacements: { path: pathMap[featureName], featureName },
        type: Sequelize.QueryTypes.UPDATE,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Clean up in reverse order of creation
    await queryInterface.bulkDelete('RoleFeatures', null, {});
    await queryInterface.bulkDelete('Features', null, {});
    await queryInterface.bulkDelete('Submodules', null, {});
    await queryInterface.bulkDelete('modules', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.bulkDelete('actions', null, {});
  },
};
