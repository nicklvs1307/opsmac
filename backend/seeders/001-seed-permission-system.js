"""'use strict';

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
      { key: 'dashboard', name: 'Dashboard' },
      { key: 'fidelity', name: 'Fidelidade' },
      { key: 'stock', name: 'Estoque' },
      { key: 'orders', name: 'Pedidos' },
      { key: 'management', name: 'Gestão' },
      { key: 'cdv', name: 'CDV' },
      { key: 'financial', name: 'Financeiro' },
      { key: 'settings', name: 'Configurações' },
      { key: 'admin', name: 'Admin' },
    ].map(m => ({ ...m, id: Sequelize.literal('gen_random_uuid()'), created_at: new Date(), updated_at: new Date() }));
    await queryInterface.bulkInsert('modules', modulesData, {});
    const modules = await queryInterface.sequelize.query('SELECT id, key FROM "modules";', { type: Sequelize.QueryTypes.SELECT });
    const moduleMap = modules.reduce((acc, m) => { acc[m.key] = m.id; return acc; }, {});

    // 4. Seed Submodules
    const submodulesData = [
      { module_id: moduleMap['dashboard'], key: 'general', name: 'Geral' },
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
        // Dashboard Module
        { key: 'dashboard:general:view', name: 'Visualizar Painel Geral', module: 'dashboard', submodule: 'general' },

        // Fidelity Module
        { key: 'fidelity:general:dashboard', name: 'Painel Inicial', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:monthly-summary', name: 'Resumo do mês', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:satisfaction-overview', name: 'Satisfação', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:surveys-comparison', name: 'Comparativo Pesquisas', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:evolution', name: 'Evolução', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:benchmarking', name: 'Benchmarking', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:multiple-choice', name: 'Multipla Escolha', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:general:word-clouds', name: 'Nuvens de Palavras', module: 'fidelity', submodule: 'general' },
        { key: 'fidelity:checkin:dashboard', name: 'Dashboard', module: 'fidelity', submodule: 'checkin' },
        { key: 'fidelity:checkin:settings', name: 'Configurações', module: 'fidelity', submodule: 'checkin' },
        { key: 'fidelity:checkin:active', name: 'Checkin Ativos', module: 'fidelity', submodule: 'checkin' },
        { key: 'fidelity:checkin:create', name: 'Criar Check-in', module: 'fidelity', submodule: 'checkin' },
        { key: 'fidelity:checkin:edit', name: 'Editar Check-in', module: 'fidelity', submodule: 'checkin' },
        { key: 'fidelity:satisfaction:dashboard', name: 'Dashboard', module: 'fidelity', submodule: 'satisfaction' },
        { key: 'fidelity:satisfaction:settings', name: 'Configurações', module: 'fidelity', submodule: 'satisfaction' },
        { key: 'fidelity:satisfaction:surveys', name: 'Pesquisas', module: 'fidelity', submodule: 'satisfaction' },
        { key: 'fidelity:satisfaction:nps-criteria', name: 'Critérios NPS', module: 'fidelity', submodule: 'satisfaction' },
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

        // Stock Module
        { key: 'stock:general:dashboard', name: 'Dashboard', module: 'stock', submodule: 'general' },
        { key: 'stock:general:movements', name: 'Movimentações', module: 'stock', submodule: 'general' },
        { key: 'stock:general:suppliers', name: 'Fornecedores', module: 'stock', submodule: 'general' },
        { key: 'stock:general:purchases', name: 'Compras', module: 'stock', submodule: 'general' },
        { key: 'stock:general:sales', name: 'Vendas', module: 'stock', submodule: 'general' },
        { key: 'stock:general:products', name: 'Produtos', module: 'stock', submodule: 'general' },
        { key: 'stock:general:ingredients', name: 'Ingredientes e Insumos', module: 'stock', submodule: 'general' },
        { key: 'stock:general:settings', name: 'Configurações', module: 'stock', submodule: 'general' },
        { key: 'stock:general:reports', name: 'Relatorios', module: 'stock', submodule: 'general' },
        { key: 'stock:general:counting', name: 'Contagem de Estoque', module: 'stock', submodule: 'general' },
        { key: 'stock:general:inventory', name: 'Inventario', module: 'stock', submodule: 'general' },
        { key: 'stock:technical-sheet:create', name: 'Cadastro', module: 'stock', submodule: 'technical-sheet' },
        { key: 'stock:technical-sheet:list', name: 'Fichas Tecnicas', module: 'stock', submodule: 'technical-sheet' },
        { key: 'stock:general:cmv', name: 'CMV', module: 'stock', submodule: 'general' },
        { key: 'stock:general:adjustments', name: 'Perdas e Ajustes', module: 'stock', submodule: 'general' },
        { key: 'stock:general:lots', name: 'Lotes e Validades', module: 'stock', submodule: 'general' },
        { key: 'stock:general:alerts', name: 'Alertas', module: 'stock', submodule: 'general' },

        // Orders Module
        { key: 'orders:general:dashboard', name: 'Painel', module: 'orders', submodule: 'general' },
        { key: 'orders:general:pdv', name: 'PDV', module: 'orders', submodule: 'general' },
        { key: 'orders:general:list', name: 'Pedidos', module: 'orders', submodule: 'general' },
        { key: 'orders:general:integrations', name: 'Integrações', module: 'orders', submodule: 'general' },
        { key: 'orders:general:delivery', name: 'Delivery', module: 'orders', submodule: 'general' },
        { key: 'orders:general:sales-report', name: 'Relatorio de Vendas', module: 'orders', submodule: 'general' },
        { key: 'orders:general:categories', name: 'Categorias', module: 'orders', submodule: 'general' },
        { key: 'orders:hall:tables', name: 'Mesas', module: 'orders', submodule: 'hall' },

        // Management Module
        { key: 'management:general:dashboard', name: 'Dashboard', module: 'management', submodule: 'general' },
        { key: 'management:general:schedule', name: 'Escala de Funcionarios', module: 'management', submodule: 'general' },
        { key: 'management:general:commissions', name: 'Controle de Comissões', module: 'management', submodule: 'general' },
        { key: 'management:general:costs', name: 'Custos Fixos e Variaveis', module: 'management', submodule: 'general' },
        { key: 'management:general:team', name: 'Equipe', module: 'management', submodule: 'general' },
        { key: 'management:general:production', name: 'Produção', module: 'management', submodule: 'general' },
        { key: 'management:general:permissions', name: 'Permissões', module: 'management', submodule: 'general' },

        // CDV Module
        { key: 'cdv:general:dashboard', name: 'Painel', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:labels', name: 'Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:labels-print', name: 'Impressão Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:labels-print-group', name: 'Impressão em Grupo', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:labels-count', name: 'Contagem de Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:labels-count-history', name: 'Historico de Contagem', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:labels-history', name: 'Historico de Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:labels-delete', name: 'Exclusão de Etiquetas', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:stock-count', name: 'Contagem de Estoque', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:expirations', name: 'Validades', module: 'cdv', submodule: 'general' },
        { key: 'cdv:general:expirations-alert', name: 'Alerta de Validades', module: 'cdv', submodule: 'general' },

        // Financial Module
        { key: 'financial:payables:suppliers', name: 'Fornecedores', module: 'financial', submodule: 'payables' },
        { key: 'financial:payables:deadlines', name: 'Prazos', module: 'financial', submodule: 'payables' },
        { key: 'financial:payables:invoices', name: 'Boletos', module: 'financial', submodule: 'payables' },
        { key: 'financial:payables:recurring', name: 'Recorrencia', module: 'financial', submodule: 'payables' },
        { key: 'financial:general:receivables', name: 'Contas a Receber', module: 'financial', submodule: 'general' },
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

        // Settings Module
        { key: 'settings:general:view', name: 'Visualizar Configurações', module: 'settings', submodule: 'general' },
        { key: 'settings:general:edit', name: 'Editar Configurações', module: 'settings', submodule: 'general' },
        { key: 'settings:general:profile', name: 'Visualizar Configurações de Perfil', module: 'settings', submodule: 'general' },
        { key: 'settings:general:business', name: 'Visualizar Configurações da Empresa', module: 'settings', submodule: 'general' },
        { key: 'settings:general:security', name: 'Visualizar Configurações de Segurança', module: 'settings', submodule: 'general' },
        { key: 'settings:general:whatsapp', name: 'Visualizar Configurações de WhatsApp', module: 'settings', submodule: 'general' },
        { key: 'settings:general:notifications', name: 'Visualizar Configurações de Notificações', module: 'settings', submodule: 'general' },
        { key: 'settings:general:appearance', name: 'Visualizar Configurações de Aparência', module: 'settings', submodule: 'general' },

        // Admin Module
        { key: 'admin:users', name: 'Gerenciar Usuários', module: 'admin', submodule: 'users' },
        { key: 'admin:restaurants', name: 'Gerenciar Restaurantes', module: 'admin', submodule: 'restaurants' },
        { key: 'admin:permissions', name: 'Gerenciar Permissões', module: 'admin', submodule: 'permissions' },
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
        'dashboard:general:view',
        'fidelity:general:dashboard',
        'settings:general:view',
        'settings:general:profile',
        'settings:general:business',
        'settings:general:security',
        'settings:general:whatsapp',
        'settings:general:notifications',
        'settings:general:appearance',
        'fidelity:coupons:list',
        'fidelity:coupons:rewards',
    ];

    if (roleMap.owner) {
        for (const featureKey of ownerFeatures) {
            if (featureMap[featureKey]) {
                // Owners get all actions for their allowed features
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
    // This is a destructive migration, so the down method will just clear everything.
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('features', null, {});
    await queryInterface.bulkDelete('submodules', null, {});
    await queryInterface.bulkDelete('modules', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('actions', null, {});
  },
};
""