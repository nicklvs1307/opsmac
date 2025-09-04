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
    const featuresToInsert = [
      { key: 'fidelity:general:dashboard', name: 'Painel Inicial', submodule_id: getSubmoduleId('fidelity', 'general') },
      { key: 'fidelity:general:monthly-summary', name: 'Resumo do mês', submodule_id: getSubmoduleId('fidelity', 'general') },
      { key: 'fidelity:general:satisfaction-overview', name: 'Satisfação', submodule_id: getSubmoduleId('fidelity', 'general') },
      { key: 'fidelity:general:surveys-comparison', name: 'Comparativo Pesquisas', submodule_id: getSubmoduleId('fidelity', 'general') },
      { key: 'fidelity:general:evolution', name: 'Evolução', submodule_id: getSubmoduleId('fidelity', 'general') },
      { key: 'fidelity:general:benchmarking', name: 'Benchmarking', submodule_id: getSubmoduleId('fidelity', 'general') },
      { key: 'fidelity:general:multiple-choice', name: 'Multipla Escolha', submodule_id: getSubmoduleId('fidelity', 'general') },
      { key: 'fidelity:general:word-clouds', name: 'Nuvens de Palavras', submodule_id: getSubmoduleId('fidelity', 'general') },
      { key: 'dashboard:view', name: 'Visualizar Painel Geral', submodule_id: null },
      { key: 'fidelity:checkin:dashboard', name: 'Dashboard', submodule_id: getSubmoduleId('fidelity', 'checkin') },
      { key: 'fidelity:checkin:settings', name: 'Configurações', submodule_id: getSubmoduleId('fidelity', 'checkin') },
      { key: 'fidelity:checkin:active', name: 'Checkin Ativos', submodule_id: getSubmoduleId('fidelity', 'checkin') },
      { key: 'checkin:create', name: 'Criar Check-in', submodule_id: getSubmoduleId('fidelity', 'checkin') },
      { key: 'checkin:edit', name: 'Editar Check-in', submodule_id: getSubmoduleId('fidelity', 'checkin') },
      { key: 'fidelity:satisfaction:dashboard', name: 'Dashboard', submodule_id: getSubmoduleId('fidelity', 'satisfaction') },
      { key: 'fidelity:satisfaction:settings', name: 'Configurações', submodule_id: getSubmoduleId('fidelity', 'satisfaction') },
      { key: 'fidelity:satisfaction:surveys', name: 'Pesquisas', submodule_id: getSubmoduleId('fidelity', 'satisfaction') },
      { key: 'npsCriteria:view', name: 'Visualizar Critérios NPS', submodule_id: getSubmoduleId('fidelity', 'satisfaction') },
      { key: 'npsCriteria:edit', name: 'Editar Critérios NPS', submodule_id: getSubmoduleId('fidelity', 'satisfaction') },
      { key: 'fidelity:responses:dashboard', name: 'Painel', submodule_id: getSubmoduleId('fidelity', 'responses') },
      { key: 'fidelity:responses:management', name: 'Gestão as Respostas', submodule_id: getSubmoduleId('fidelity', 'responses') },
      { key: 'fidelity:responses:replicas', name: 'Replicas', submodule_id: getSubmoduleId('fidelity', 'responses') },
      { key: 'fidelity:responses:goals', name: 'Metas', submodule_id: getSubmoduleId('fidelity', 'responses') },
      { key: 'fidelity:responses:import', name: 'Importar', submodule_id: getSubmoduleId('fidelity', 'responses') },
      { key: 'fidelity:relationship:dashboard', name: 'Dashboard', submodule_id: getSubmoduleId('fidelity', 'relationship') },
      { key: 'fidelity:relationship:ranking', name: 'Ranking de Clientes', submodule_id: getSubmoduleId('fidelity', 'relationship') },
      { key: 'fidelity:relationship:dispatches', name: 'Disparos', submodule_id: getSubmoduleId('fidelity', 'relationship') },
      { key: 'fidelity:relationship:campaigns', name: 'Campanhas Automaticas', submodule_id: getSubmoduleId('fidelity', 'relationship') },
      { key: 'fidelity:relationship:messages', name: 'Mensagens', submodule_id: getSubmoduleId('fidelity', 'relationship') },
      { key: 'fidelity:relationship:birthdays', name: 'Aniversariantes', submodule_id: getSubmoduleId('fidelity', 'relationship') },
      { key: 'fidelity:relationship:customers', name: 'Gestão de Clientes', submodule_id: getSubmoduleId('fidelity', 'relationship') },
      { key: 'fidelity:relationship:segmentation', name: 'Segmentação de Clientes', submodule_id: getSubmoduleId('fidelity', 'relationship') },
      { key: 'fidelity:coupons:dashboard', name: 'Painel', submodule_id: getSubmoduleId('fidelity', 'coupons') },
      { key: 'fidelity:coupons:list', name: 'Cupons', submodule_id: getSubmoduleId('fidelity', 'coupons') },
      { key: 'fidelity:coupons:management', name: 'Gestão de Cupons', submodule_id: getSubmoduleId('fidelity', 'coupons') },
      { key: 'fidelity:coupons:validation', name: 'Validação', submodule_id: getSubmoduleId('fidelity', 'coupons') },
      { key: 'fidelity:coupons:raffle', name: 'Sorteio', submodule_id: getSubmoduleId('fidelity', 'coupons') },
      { key: 'fidelity:coupons:rewards', name: 'Recompensas', submodule_id: getSubmoduleId('fidelity', 'coupons') },
      { key: 'fidelity:coupons:rewards-management', name: 'Gestão de Recompensas', submodule_id: getSubmoduleId('fidelity', 'coupons') },
      { key: 'fidelity:coupons:rewards-create', name: 'Cadastro de Recompensas', submodule_id: getSubmoduleId('fidelity', 'coupons') },
      { key: 'fidelity:coupons:redemption-reports', name: 'Relatorios de Resgate', submodule_id: getSubmoduleId('fidelity', 'coupons') },
      { key: 'fidelity:automation:flows', name: 'Fluxos', submodule_id: getSubmoduleId('fidelity', 'automation') },
      { key: 'fidelity:integrations', name: 'Integrações', module_id: moduleMap['fidelity'], submodule_id: null },
      { key: 'fidelity:reports', name: 'Relatorios', module_id: moduleMap['fidelity'], submodule_id: null },
      { key: 'stock:dashboard', name: 'Dashboard', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:movements', name: 'Movimentações', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:suppliers', name: 'Fornecedores', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:purchases', name: 'Compras', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:sales', name: 'Vendas', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:products', name: 'Produtos', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:products:create', name: 'Cadastro de Produtos', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:ingredients', name: 'Ingredientes e Insumos', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:settings', name: 'Configurações', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:reports', name: 'Relatorios', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:counting', name: 'Contagem de Estoque', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:inventory', name: 'Inventario', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:technical-sheet:create', name: 'Cadastro', submodule_id: getSubmoduleId('stock', 'technical-sheet') },
      { key: 'stock:technical-sheet:list', name: 'Fichas Tecnicas', submodule_id: getSubmoduleId('stock', 'technical-sheet') },
      { key: 'stock:cmv', name: 'CMV', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:adjustments', name: 'Perdas e Ajustes', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:lots', name: 'Lotes e Validades', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:alerts', name: 'Alertas', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'orders:dashboard', name: 'Painel', module_id: moduleMap['orders'], submodule_id: null },
      { key: 'orders:pdv', name: 'PDV', module_id: moduleMap['orders'], submodule_id: null },
      { key: 'orders:list', name: 'Pedidos', module_id: moduleMap['orders'], submodule_id: null },
      { key: 'orders:integrations', name: 'Integrações', module_id: moduleMap['orders'], submodule_id: null },
      { key: 'orders:delivery', name: 'Delivery', module_id: moduleMap['orders'], submodule_id: null },
      { key: 'orders:sales-report', name: 'Relatorio de Vendas', module_id: moduleMap['orders'], submodule_id: null },
      { key: 'orders:hall:tables', name: 'Mesas', submodule_id: getSubmoduleId('orders', 'hall') },
      { key: 'management:dashboard', name: 'Dashboard', module_id: moduleMap['management'], submodule_id: null },
      { key: 'management:schedule', name: 'Escala de Funcionarios', module_id: moduleMap['management'], submodule_id: null },
      { key: 'management:commissions', name: 'Controle de Comissões', module_id: moduleMap['management'], submodule_id: null },
      { key: 'management:costs', name: 'Custos Fixos e Variaveis', module_id: moduleMap['management'], submodule_id: null },
      { key: 'management:team', name: 'Equipe', module_id: moduleMap['management'], submodule_id: null },
      { key: 'management:production', name: 'Produção', module_id: moduleMap['management'], submodule_id: null },
      { key: 'management:permissions', name: 'Permissões', module_id: moduleMap['management'], submodule_id: null },
      { key: 'cdv:dashboard', name: 'Painel', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:labels', name: 'Etiquetas', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:labels:print', name: 'Impressão Etiquetas', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:labels:print-group', name: 'Impressão em Grupo', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:labels:count', name: 'Contagem de Etiquetas', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:labels:count-history', name: 'Historico de Contagem', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:labels:history', name: 'Historico de Etiquetas', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:labels:delete', name: 'Exclusão de Etiquetas', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:stock-count', name: 'Contagem de Estoque', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:expirations', name: 'Validades', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'cdv:expirations-alert', name: 'Alerta de Validades', module_id: moduleMap['cdv'], submodule_id: null },
      { key: 'financial:payables:suppliers', name: 'Fornecedores', submodule_id: getSubmoduleId('financial', 'payables') },
      { key: 'financial:payables:deadlines', name: 'Prazos', submodule_id: getSubmoduleId('financial', 'payables') },
      { key: 'financial:payables:invoices', name: 'Boletos', submodule_id: getSubmoduleId('financial', 'payables') },
      { key: 'financial:payables:recurring', name: 'Recorrencia', submodule_id: getSubmoduleId('financial', 'payables') },
      { key: 'financial:receivables', name: 'Contas a Receber', module_id: moduleMap['financial'], submodule_id: null },
      { key: 'financial:cash-flow:dashboard', name: 'Painel', submodule_id: getSubmoduleId('financial', 'cash-flow') },
      { key: 'financial:cash-flow:view', name: 'Visão', submodule_id: getSubmoduleId('financial', 'cash-flow') },
      { key: 'financial:cash-flow:projection', name: 'Projeção', submodule_id: getSubmoduleId('financial', 'cash-flow') },
      { key: 'financial:cash-flow:history', name: 'Historico', submodule_id: getSubmoduleId('financial', 'cash-flow') },
      { key: 'financial:dre:view', name: 'Visão', submodule_id: getSubmoduleId('financial', 'dre') },
      { key: 'financial:dre:revenue', name: 'Receita', submodule_id: getSubmoduleId('financial', 'dre') },
      { key: 'financial:dre:cmv', name: 'Custo Variavel (CMV)', submodule_id: getSubmoduleId('financial', 'dre') },
      { key: 'financial:dre:gross-margin', name: 'Margem Bruta', submodule_id: getSubmoduleId('financial', 'dre') },
      { key: 'financial:dre:fixed-costs', name: 'Custos Fixos', submodule_id: getSubmoduleId('financial', 'dre') },
      { key: 'financial:dre:net-profit', name: 'Lucro Liquido', submodule_id: getSubmoduleId('financial', 'dre') },
      { key: 'financial:payments:methods', name: 'Meio de Pagamentos', submodule_id: getSubmoduleId('financial', 'payments') },
      { key: 'financial:payments:fees', name: 'Taxas', submodule_id: getSubmoduleId('financial', 'payments') },
      { key: 'financial:payments:reports', name: 'Relatorios', submodule_id: getSubmoduleId('financial', 'payments') },
      { key: 'financial:fiscal:invoices', name: 'Notas Fiscais', submodule_id: getSubmoduleId('financial', 'fiscal') },
      { key: 'financial:fiscal:taxes', name: 'Impostos', submodule_id: getSubmoduleId('financial', 'fiscal') },
      { key: 'financial:fiscal:sefaz', name: 'Integração SEFAZ', submodule_id: getSubmoduleId('financial', 'fiscal') },
      { key: 'financial:fiscal:reports', name: 'Relatórios', submodule_id: getSubmoduleId('financial', 'fiscal') },
      { key: 'financial:fiscal:settings', name: 'Configurações', submodule_id: getSubmoduleId('financial', 'fiscal') },
      { key: 'settings:view', name: 'Visualizar Configurações', module_id: moduleMap['settings'], submodule_id: null },
      { key: 'settings:edit', name: 'Editar Configurações', module_id: moduleMap['settings'], submodule_id: null },
      { key: 'settings:profile:view', name: 'Visualizar Configurações de Perfil', module_id: moduleMap['settings'], submodule_id: null },
      { key: 'settings:business:view', name: 'Visualizar Configurações da Empresa', module_id: moduleMap['settings'], submodule_id: null },
      { key: 'settings:security:view', name: 'Visualizar Configurações de Segurança', module_id: moduleMap['settings'], submodule_id: null },
      { key: 'settings:whatsapp:view', name: 'Visualizar Configurações de WhatsApp', module_id: moduleMap['settings'], submodule_id: null },
      { key: 'settings:notifications:view', name: 'Visualizar Configurações de Notificações', module_id: moduleMap['settings'], submodule_id: null },
      { key: 'settings:appearance:view', name: 'Visualizar Configurações de Aparência', module_id: moduleMap['settings'], submodule_id: null },
      { key: 'admin:users:view', name: 'Visualizar Usuários', submodule_id: getSubmoduleId('admin', 'users') },
      { key: 'admin:users:create', name: 'Criar Usuários', submodule_id: getSubmoduleId('admin', 'users') },
      { key: 'admin:users:edit', name: 'Editar Usuários', submodule_id: getSubmoduleId('admin', 'users') },
      { key: 'admin:users:delete', name: 'Excluir Usuários', submodule_id: getSubmoduleId('admin', 'users') },
      { key: 'admin:restaurants:view', name: 'Visualizar Restaurantes', submodule_id: getSubmoduleId('admin', 'restaurants') },
      { key: 'admin:restaurants:create', name: 'Criar Restaurantes', submodule_id: getSubmoduleId('admin', 'restaurants') },
      { key: 'admin:restaurants:edit', name: 'Editar Restaurantes', submodule_id: getSubmoduleId('admin', 'restaurants') },
      { key: 'admin:restaurants:delete', name: 'Excluir Restaurantes', submodule_id: getSubmoduleId('admin', 'restaurants') },
      { key: 'admin:permissions:view', name: 'Visualizar Permissões', submodule_id: getSubmoduleId('admin', 'permissions') },
      { key: 'stock:products:view', name: 'Visualizar Produtos', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:products:edit', name: 'Editar Produtos', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'stock:products:delete', name: 'Excluir Produtos', module_id: moduleMap['stock'], submodule_id: null },
      { key: 'categories:view', name: 'Visualizar Categorias', module_id: moduleMap['orders'], submodule_id: null },
      { key: 'categories:create', name: 'Criar Categorias', module_id: moduleMap['orders'], submodule_id: null },
      { key: 'categories:edit', name: 'Editar Categorias', module_id: moduleMap['orders'], submodule_id: null },
      { key: 'categories:delete', name: 'Excluir Categorias', module_id: moduleMap['orders'], submodule_id: null },
    ].map(f => ({ ...f, id: Sequelize.literal('gen_random_uuid()'), created_at: new Date(), updated_at: new Date() }));
    await queryInterface.bulkInsert('features', featuresToInsert, {});

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
