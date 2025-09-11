'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Clean up existing data
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});
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
      { module_id: moduleMap['stock'], key: 'general', name: 'Geral' },
      { module_id: moduleMap['stock'], key: 'technical-sheet', name: 'Ficha Tecnica' },
      { module_id: moduleMap['orders'], key: 'general', name: 'Geral' },
      { module_id: moduleMap['orders'], key: 'hall', name: 'Salão' },
      { module_id: moduleMap['management'], key: 'general', name: 'Geral' },
      { module_id: moduleMap['cdv'], key: 'general', name: 'Geral' },
      { module_id: moduleMap['financial'], key: 'general', name: 'Geral' },
      { module_id: moduleMap['financial'], key: 'payables', name: 'Contas a Pagar' },
      { module_id: moduleMap['financial'], key: 'cash-flow', name: 'Fluxo de Caixa' },
      { module_id: moduleMap['financial'], key: 'dre', name: 'DRE' },
      { module_id: moduleMap['financial'], key: 'payments', name: 'Pagamentos' },
      { module_id: moduleMap['financial'], key: 'fiscal', name: 'Fiscal' },
      { module_id: moduleMap['settings'], key: 'general', name: 'Geral' },
      { module_id: moduleMap['admin'], key: 'general', name: 'Geral' },
      { module_id: moduleMap['admin'], key: 'users', name: 'Usuários' },
      { module_id: moduleMap['admin'], key: 'restaurants', name: 'Restaurantes' },
      { module_id: moduleMap['admin'], key: 'permissions', name: 'Permissões' },
    ].map(s => ({ ...s, id: Sequelize.literal('gen_random_uuid()'), created_at: new Date(), updated_at: new Date() }));
    await queryInterface.bulkInsert('submodules', submodulesData, {});
    const submodules = await queryInterface.sequelize.query('SELECT id, key, module_id FROM "submodules";', { type: Sequelize.QueryTypes.SELECT });
    const getSubmoduleId = (moduleKey, submoduleKey) => {
        const moduleId = moduleMap[moduleKey];
        const submodule = submodules.find(s => s.module_id === moduleId && s.key === submoduleKey);
        return submodule ? submodule.id : null;
    };

    // 5. Seed Features
    const featuresToInsertRaw = [
        { key: 'fidelity:general:dashboard', name: 'Painel Inicial', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:monthly-summary', name: 'Resumo do mês', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:satisfaction-overview', name: 'Satisfação', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:surveys-comparison', name: 'Comparativo Pesquisas', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:evolution', name: 'Evolução', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:benchmarking', name: 'Benchmarking', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:multiple-choice', name: 'Multipla Escolha', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:word-clouds', name: 'Nuvens de Palavras', module: 'fidelity', submodule: 'general' },
        { key: 'dashboard:view', name: 'Visualizar Painel Geral', module: 'admin', submodule: 'general' },
        { key: 'fidelity:checkin:dashboard', name: 'Dashboard', module: 'fidelity', submodule: 'checkin' },
        { key: 'fidelity:checkin:settings', name: 'Configurações', module: 'fidelity', submodule: 'checkin' },
        { key: 'fidelity:checkin:active', name: 'Checkin Ativos', module: 'fidelity', submodule: 'checkin' },
        { key: 'checkin:create', name: 'Criar Check-in', module: 'fidelity', submodule: 'checkin' },
        { key: 'checkin:edit', name: 'Editar Check-in', module: 'fidelity', submodule: 'checkin' },
        { key: 'fidelity:satisfaction:dashboard', name: 'Dashboard', module: 'fidelity', submodule: 'satisfaction' },
        { key: 'fidelity:satisfaction:settings', name: 'Configurações', module: 'fidelity', submodule: 'satisfaction' },
        { key: 'fidelity:satisfaction:surveys', name: 'Pesquisas', module: 'fidelity', submodule: 'satisfaction' },
        { key: 'npsCriteria:view', name: 'Visualizar Critérios NPS', module: 'fidelity', submodule: 'satisfaction' },
        { key: 'npsCriteria:edit', name: 'Editar Critérios NPS', module: 'fidelity', submodule: 'satisfaction' },
        { key: 'fidelity:responses:dashboard', name: 'Painel', module: 'fidelity', submodule: 'responses' },
        { key: 'fidelity:responses:management', name: 'Gestão as Respostas', module: 'fidelity', submodule: 'responses' },
        { key: 'fidelity:responses:replicas', name: 'Replicas', module: 'fidelity', submodule: 'responses' },
        { key: 'fidelity:responses:goals', name: 'Metas', module: 'fidelity', submodule: 'responses' },
        { key: 'fidelity:responses:import', name: 'Importar', module: 'fidelity', submodule: 'responses' },
        { key: 'fidelity:relationship:dashboard', name: 'Dashboard', module: 'fidelity', submodule: 'relationship' },
        { key: 'fidelity:relationship:ranking', name: 'Ranking de Clientes', module: 'fidelity', submodule: 'relationship' },
        { key: 'fidelity:relationship:dispatches', name: 'Disparos', module: 'fidelity', submodule: 'relationship' },
        { key: 'fidelity:relationship:campaigns', name: 'Campanhas Automaticas', module: 'fidelity', submodule: 'relationship' },
        { key: 'fidelity:relationship:messages', name: 'Mensagens', module: 'fidelity', submodule: 'relationship' },
        { key: 'fidelity:relationship:birthdays', name: 'Aniversariantes', module: 'fidelity', submodule: 'relationship' },
        { key: 'fidelity:relationship:customers', name: 'Gestão de Clientes', module: 'fidelity', submodule: 'relationship' },
        { key: 'fidelity:relationship:segmentation', name: 'Segmentação de Clientes', module: 'fidelity', submodule: 'relationship' },
        { key: 'fidelity:coupons:dashboard', name: 'Painel', module: 'fidelity', submodule: 'coupons' },
        { key: 'fidelity:coupons:list', name: 'Cupons', module: 'fidelity', submodule: 'coupons' },
        { key: 'fidelity:coupons:management', name: 'Gestão de Cupons', module: 'fidelity', submodule: 'coupons' },
        { key: 'fidelity:coupons:validation', name: 'Validação', module: 'fidelity', submodule: 'coupons' },
        { key: 'fidelity:coupons:raffle', name: 'Sorteio', module: 'fidelity', submodule: 'coupons' },
        { key: 'fidelity:coupons:rewards', name: 'Recompensas', module: 'fidelity', submodule: 'coupons' },
        { key: 'fidelity:coupons:rewards-management', name: 'Gestão de Recompensas', module: 'fidelity', submodule: 'coupons' },
        { key: 'fidelity:coupons:rewards-create', name: 'Cadastro de Recompensas', module: 'fidelity', submodule: 'coupons' },
        { key: 'fidelity:coupons:redemption-reports', name: 'Relatorios de Resgate', module: 'fidelity', submodule: 'coupons' },
        { key: 'fidelity:automation:flows', name: 'Fluxos', module: 'fidelity', submodule: 'automation' },
        { key: 'fidelity:integrations', name: 'Integrações', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:reports', name: 'Relatorios', module: 'fidelity', submodule: 'general' },
        { key: 'stock:dashboard', name: 'Dashboard', module: 'stock', submodule: 'general' },
        { key: 'stock:movements', name: 'Movimentações', module: 'stock', submodule: 'general' },
        { key: 'stock:suppliers', name: 'Fornecedores', module: 'stock', submodule: 'general' },
        { key: 'stock:purchases', name: 'Compras', module: 'stock', submodule: 'general' },
        { key: 'stock:sales', name: 'Vendas', module: 'stock', submodule: 'general' },
        { key: 'stock:products', name: 'Produtos', module: 'stock', submodule: 'general' },
        { key: 'stock:products:create', name: 'Cadastro de Produtos', module: 'stock', submodule: 'general' },
        { key: 'stock:ingredients', name: 'Ingredientes e Insumos', module: 'stock', submodule: 'general' },
        { key: 'stock:settings', name: 'Configurações', module: 'stock', submodule: 'general' },
        { key: 'stock:reports', name: 'Relatorios', module: 'stock', submodule: 'general' },
        { key: 'stock:counting', name: 'Contagem de Estoque', module: 'stock', submodule: 'general' },
        { key: 'stock:inventory', name: 'Inventario', module: 'stock', submodule: 'general' },
        { key: 'stock:technical-sheet:create', name: 'Cadastro', module: 'stock', submodule: 'technical-sheet' },
        { key: 'stock:technical-sheet:list', name: 'Fichas Tecnicas', module: 'stock', submodule: 'technical-sheet' },
        { key: 'stock:cmv', name: 'CMV', module: 'stock', submodule: 'general' },
        { key: 'stock:adjustments', name: 'Perdas e Ajustes', module: 'stock', submodule: 'general' },
        { key: 'stock:lots', name: 'Lotes e Validades', module: 'stock', submodule: 'general' },
        { key: 'stock:alerts', name: 'Alertas', module: 'stock', submodule: 'general' },
        { key: 'orders:dashboard', name: 'Painel', module: 'orders', submodule: 'general' },
        { key: 'orders:pdv', name: 'PDV', module: 'orders', submodule: 'general' },
        { key: 'orders:list', name: 'Pedidos', module: 'orders', submodule: 'general' },
        { key: 'orders:integrations', name: 'Integrações', module: 'orders', submodule: 'general' },
        { key: 'orders:delivery', name: 'Delivery', module: 'orders', submodule: 'general' },
        { key: 'orders:sales-report', name: 'Relatorio de Vendas', module: 'orders', submodule: 'general' },
        { key: 'orders:hall:tables', name: 'Mesas', module: 'orders', submodule: 'hall' },
        { key: 'management:dashboard', name: 'Dashboard', module: 'management', submodule: 'general' },
        { key: 'management:schedule', name: 'Escala de Funcionarios', module: 'management', submodule: 'general' },
        { key: 'management:commissions', name: 'Controle de Comissões', module: 'management', submodule: 'general' },
        { key: 'management:costs', name: 'Custos Fixos e Variaveis', module: 'management', submodule: 'general' },
        { key: 'management:team', name: 'Equipe', module: 'management', submodule: 'general' },
        { key: 'management:production', name: 'Produção', module: 'management', submodule: 'general' },
        { key: 'management:permissions', name: 'Permissões', module: 'management', submodule: 'general' },
        { key: 'cdv:dashboard', name: 'Painel', module: 'cdv', submodule: 'general' },
        { key: 'cdv:labels', name: 'Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:labels:print', name: 'Impressão Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:labels:print-group', name: 'Impressão em Grupo', module: 'cdv', submodule: 'general' },
        { key: 'cdv:labels:count', name: 'Contagem de Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:labels:count-history', name: 'Historico de Contagem', module: 'cdv', submodule: 'general' },
        { key: 'cdv:labels:history', name: 'Historico de Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:labels:delete', name: 'Exclusão de Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:stock-count', name: 'Contagem de Estoque', module: 'cdv', submodule: 'general' },
        { key: 'cdv:expirations', name: 'Validades', module: 'cdv', submodule: 'general' },
        { key: 'cdv:expirations-alert', name: 'Alerta de Validades', module: 'cdv', submodule: 'general' },
        { key: 'financial:payables:suppliers', name: 'Fornecedores', module: 'financial', submodule: 'payables' },
        { key: 'financial:payables:deadlines', name: 'Prazos', module: 'financial', submodule: 'payables' },
        { key: 'financial:payables:invoices', name: 'Boletos', module: 'financial', submodule: 'payables' },
        { key: 'financial:payables:recurring', name: 'Recorrencia', module: 'financial', submodule: 'payables' },
        { key: 'financial:receivables', name: 'Contas a Receber', module: 'financial', submodule: 'general' },
        { key: 'financial:cash-flow:dashboard', name: 'Painel', module: 'financial', submodule: 'cash-flow' },
        { key: 'financial:cash-flow:view', name: 'Visão', module: 'financial', submodule: 'cash-flow' },
        { key: 'financial:cash-flow:projection', name: 'Projeção', module: 'financial', submodule: 'cash-flow' },
        { key: 'financial:cash-flow:history', name: 'Historico', module: 'financial', submodule: 'cash-flow' },
        { key: 'financial:dre:view', name: 'Visão', module: 'financial', submodule: 'dre' },
        { key: 'financial:dre:revenue', name: 'Receita', module: 'financial', submodule: 'dre' },
        { key: 'financial:dre:cmv', name: 'Custo Variavel (CMV)', module: 'financial', submodule: 'dre' },
        { key: 'financial:dre:gross-margin', name: 'Margem Bruta', module: 'financial', submodule: 'dre' },
        { key: 'financial:dre:fixed-costs', name: 'Custos Fixos', module: 'financial', submodule: 'dre' },
        { key: 'financial:dre:net-profit', name: 'Lucro Liquido', module: 'financial', submodule: 'dre' },
        { key: 'financial:payments:methods', name: 'Meio de Pagamentos', module: 'financial', submodule: 'payments' },
        { key: 'financial:payments:fees', name: 'Taxas', module: 'financial', submodule: 'payments' },
        { key: 'financial:payments:reports', name: 'Relatorios', module: 'financial', submodule: 'payments' },
        { key: 'financial:fiscal:invoices', name: 'Notas Fiscais', module: 'financial', submodule: 'fiscal' },
        { key: 'financial:fiscal:taxes', name: 'Impostos', module: 'financial', submodule: 'fiscal' },
        { key: 'financial:fiscal:sefaz', name: 'Integração SEFAZ', module: 'financial', submodule: 'fiscal' },
        { key: 'financial:fiscal:reports', name: 'Relatórios', module: 'financial', submodule: 'fiscal' },
        { key: 'financial:fiscal:settings', name: 'Configurações', module: 'financial', submodule: 'fiscal' },
        { key: 'settings:view', name: 'Visualizar Configurações', module: 'settings', submodule: 'general' },
        { key: 'settings:edit', name: 'Editar Configurações', module: 'settings', submodule: 'general' },
        { key: 'settings:profile:view', name: 'Visualizar Configurações de Perfil', module: 'settings', submodule: 'general' },
        { key: 'settings:business:view', name: 'Visualizar Configurações da Empresa', module: 'settings', submodule: 'general' },
        { key: 'settings:security:view', name: 'Visualizar Configurações de Segurança', module: 'settings', submodule: 'general' },
        { key: 'settings:whatsapp:view', name: 'Visualizar Configurações de WhatsApp', module: 'settings', submodule: 'general' },
        { key: 'settings:notifications:view', name: 'Visualizar Configurações de Notificações', module: 'settings', submodule: 'general' },
        { key: 'settings:appearance:view', name: 'Visualizar Configurações de Aparência', module: 'settings', submodule: 'general' },
        { key: 'admin:users:view', name: 'Visualizar Usuários', module: 'admin', submodule: 'users' },
        { key: 'admin:users:create', name: 'Criar Usuários', module: 'admin', submodule: 'users' },
        { key: 'admin:users:edit', name: 'Editar Usuários', module: 'admin', submodule: 'users' },
        { key: 'admin:users:delete', name: 'Excluir Usuários', module: 'admin', submodule: 'users' },
        { key: 'admin:restaurants:view', name: 'Visualizar Restaurantes', module: 'admin', submodule: 'restaurants' },
        { key: 'admin:restaurants:create', name: 'Criar Restaurantes', module: 'admin', submodule: 'restaurants' },
        { key: 'admin:restaurants:edit', name: 'Editar Restaurantes', module: 'admin', submodule: 'restaurants' },
        { key: 'admin:restaurants:delete', name: 'Excluir Restaurantes', module: 'admin', submodule: 'restaurants' },
        { key: 'admin:permissions:view', name: 'Visualizar Permissões', module: 'admin', submodule: 'permissions' },
        { key: 'stock:products:view', name: 'Visualizar Produtos', module: 'stock', submodule: 'general' },
        { key: 'stock:products:edit', name: 'Editar Produtos', module: 'stock', submodule: 'general' },
        { key: 'stock:products:delete', name: 'Excluir Produtos', module: 'stock', submodule: 'general' },
        { key: 'categories:view', name: 'Visualizar Categorias', module: 'orders', submodule: 'general' },
        { key: 'categories:create', name: 'Criar Categorias', module: 'orders', submodule: 'general' },
        { key: 'categories:edit', name: 'Editar Categorias', module: 'orders', submodule: 'general' },
        { key: 'categories:delete', name: 'Excluir Categorias', module: 'orders', submodule: 'general' },
    ];

    const featuresData = featuresToInsertRaw.map(f => ({
        id: Sequelize.literal('gen_random_uuid()'),
        key: f.key,
        name: f.name,
        description: f.name, // Using name as description for now
        submodule_id: getSubmoduleId(f.module, f.submodule),
        created_at: new Date(),
        updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('features', featuresData, {});

    // 6. Seed Roles
    const rolesData = [
      { key: 'super_admin', name: 'super_admin', is_system: true },
      { key: 'owner', name: 'owner', is_system: true },
      { key: 'manager', name: 'manager', is_system: true },
      { key: 'waiter', name: 'waiter', is_system: true },
    ].map(r => ({ ...r, id: Sequelize.literal('gen_random_uuid()'), created_at: new Date(), updated_at: new Date() }));
    await queryInterface.bulkInsert('roles', rolesData, {});
    const allRoles = await queryInterface.sequelize.query('SELECT id, key FROM "roles";', { type: Sequelize.QueryTypes.SELECT });
    const roleMap = allRoles.reduce((acc, role) => { acc[role.key] = role.id; return acc; }, {});

    // 7. Seed Role Permissions
    const allFeatures = await queryInterface.sequelize.query('SELECT id, key FROM "features";', { type: Sequelize.QueryTypes.SELECT });
    const featureMap = allFeatures.reduce((acc, f) => { acc[f.key] = f.id; return acc; }, {});

    const rolePermissions = [];

    // Super admin gets all permissions
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

    // Owner permissions
    const ownerFeatures = [
        'fidelity:general:dashboard',
        'dashboard:view',
        'settings:view',
        'settings:profile:view',
        'settings:business:view',
        'settings:security:view',
        'settings:whatsapp:view',
        'settings:notifications:view',
        'settings:appearance:view',
        'fidelity:coupons:list',
        'fidelity:coupons:rewards',
    ];

    if (roleMap.owner) {
        for (const featureKey of ownerFeatures) {
            if (featureMap[featureKey]) {
                for (const action of actions) {
                    rolePermissions.push({
                        role_id: roleMap.owner,
                        feature_id: featureMap[featureKey],
                        action_id: action.id,
                        allowed: true,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
            }
        }
    }

    await queryInterface.bulkInsert('role_permissions', rolePermissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('features', null, {});
    await queryInterface.bulkDelete('submodules', null, {});
    await queryInterface.bulkDelete('modules', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('actions', null, {});
  },
};