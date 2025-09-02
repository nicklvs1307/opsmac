
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Clean up existing data
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('features', null, {});
    await queryInterface.bulkDelete('submodules', null, {});
    await queryInterface.bulkDelete('modules', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('actions', null, {});

    // 2. Seed Actions
    const actionsData = [
      { id: 1, key: 'create' }, { id: 2, key: 'read' }, { id: 3, key: 'update' },
      { id: 4, key: 'delete' }, { id: 5, key: 'export' }, { id: 6, key: 'approve' },
      { id: 7, key: 'manage_permissions' },
    ].map(a => ({ ...a, created_at: new Date(), updated_at: new Date() }));
    await queryInterface.bulkInsert('actions', actionsData, {});
    const actions = await queryInterface.sequelize.query('SELECT id, key FROM "actions";', { type: Sequelize.QueryTypes.SELECT });

    // 3. Seed Modules
    const modulesData = [
      { key: 'fidelity', name: 'Fidelidade' }, { key: 'stock', name: 'Estoque' },
      { key: 'orders', name: 'Pedidos' }, { key: 'management', name: 'Gestão' },
      { key: 'cdv', name: 'CDV' }, { key: 'financial', name: 'Financeiro' },
      { key: 'settings', name: 'Configurações' }, { key: 'admin', name: 'Admin' },
    ].map(m => ({ ...m, id: Sequelize.literal('gen_random_uuid()'), created_at: new Date(), updated_at: new Date() }));
    await queryInterface.bulkInsert('modules', modulesData, {});
    const modules = await queryInterface.sequelize.query('SELECT id, key FROM "modules";', { type: Sequelize.QueryTypes.SELECT });
    const moduleMap = modules.reduce((acc, m) => { acc[m.key] = m.id; return acc; }, {});

    // 4. Seed Submodules
    const submodulesData = [
      { module_id: moduleMap['fidelity'], key: 'general', name: 'Geral' },
      { module_id: moduleMap['fidelity'], key: 'checkin', name: 'Check in' },
      { module_id: moduleMap['fidelity'], key: 'satisfaction', name: 'Satisfação' },
      { module_id: moduleMap['fidelity'], key: 'responses', name: 'Respostas' },
      { module_id: moduleMap['fidelity'], key: 'relationship', name: 'Relacionamento' },
      { module_id: moduleMap['fidelity'], key: 'coupons', name: 'Cupons' },
      { module_id: moduleMap['fidelity'], key: 'automation', name: 'Automação' },
      { module_id: moduleMap['stock'], key: 'technical-sheet', name: 'Ficha Tecnica' },
      { module_id: moduleMap['orders'], key: 'hall', name: 'Salão' },
      { module_id: moduleMap['financial'], key: 'payables', name: 'Contas a Pagar' },
      { module_id: moduleMap['financial'], key: 'cash-flow', name: 'Fluxo de Caixa' },
      { module_id: moduleMap['financial'], key: 'dre', name: 'DRE' },
      { module_id: moduleMap['financial'], key: 'payments', name: 'Pagamentos' },
      { module_id: moduleMap['financial'], key: 'fiscal', name: 'Fiscal' },
      { module_id: moduleMap['admin'], key: 'users', name: 'Usuários' },
      { module_id: moduleMap['admin'], key: 'restaurants', name: 'Restaurantes' },
      { module_id: moduleMap['admin'], key: 'permissions', name: 'Permissões' },
      { module_id: moduleMap['admin'], key: 'general', name: 'Geral' },
    ].map(s => ({ ...s, id: Sequelize.literal('gen_random_uuid()'), created_at: new Date(), updated_at: new Date() }));
    await queryInterface.bulkInsert('submodules', submodulesData, {});
    const submodules = await queryInterface.sequelize.query('SELECT id, key, module_id FROM "submodules";', { type: Sequelize.QueryTypes.SELECT });
    const getSubmoduleId = (moduleKey, submoduleKey) => {
        const moduleId = moduleMap[moduleKey];
        const submodule = submodules.find(s => s.module_id === moduleId && s.key === submoduleKey);
        return submodule ? submodule.id : null;
    };

    // 5. Seed Features
    const featuresData = [ { key: 'dashboard_view', name: 'Visualizar Painel Geral', submodule_id: getSubmoduleId('admin', 'general') } /* PASTE ALL FEATURES HERE */];
    // This is a placeholder. The full list is very long.
    // You should replace this with the actual full list from your archived file.
    await queryInterface.bulkInsert('features', featuresData.map(f => ({...f, id: Sequelize.literal('gen_random_uuid()'), created_at: new Date(), updated_at: new Date()})), {});

    // 6. Seed Roles
    const rolesData = [
      { key: 'super_admin', name: 'Super Admin', is_system: true },
      { key: 'owner', name: 'Proprietário', is_system: true },
    ].map(r => ({ ...r, id: Sequelize.literal('gen_random_uuid()'), created_at: new Date(), updated_at: new Date() }));
    await queryInterface.bulkInsert('roles', rolesData, {});

    // 7. Seed Role Permissions
    const allRoles = await queryInterface.sequelize.query('SELECT id, key FROM "roles";', { type: Sequelize.QueryTypes.SELECT });
    const allFeatures = await queryInterface.sequelize.query('SELECT id FROM "features";', { type: Sequelize.QueryTypes.SELECT });
    const roleMap = allRoles.reduce((acc, role) => { acc[role.key] = role.id; return acc; }, {});
    const rolePermissions = [];

    if (roleMap.super_admin) {
      for (const feature of allFeatures) {
        for (const action of actions) {
          rolePermissions.push({
            role_id: roleMap.super_admin,
            feature_id: feature.id,
            action_id: action.id,
            allowed: true,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }
    await queryInterface.bulkInsert('role_permissions', rolePermissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('features', null, {});
    await queryInterface.bulkDelete('submodules', null, {});
    await queryInterface.bulkDelete('modules', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('actions', null, {});
  },
};
