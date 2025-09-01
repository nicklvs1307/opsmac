'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Seed Modules
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
    await queryInterface.bulkInsert('modules', modulesToInsert, { ignoreDuplicates: true });

    const modules = await queryInterface.sequelize.query(
      'SELECT id, name FROM "modules";',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const moduleMap = modules.reduce((acc, module) => {
      acc[module.name] = module.id;
      return acc;
    }, {});

    // 2. Seed Submodules
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
    await queryInterface.bulkInsert('Submodules', submodulesToInsert, { ignoreDuplicates: true });

    const submodules = await queryInterface.sequelize.query(
      `SELECT s.id, s.name, m.name as "moduleName" FROM "Submodules" s JOIN "modules" m ON s."moduleId" = m.id;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const getSubmoduleId = (moduleName, submoduleName) => {
        const submodule = submodules.find(s => s.moduleName === moduleName && s.name === submoduleName);
        return submodule ? submodule.id : null;
    };

    // 3. Seed Features
    const featuresToInsert = [
      // Fidelity
      { name: 'fidelity:general:dashboard', description: 'Painel Inicial', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'general') },
      { name: 'fidelity:general:monthly-summary', description: 'Resumo do mês', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'general') },
      { name: 'fidelity:general:satisfaction-overview', description: 'Satisfação', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'general') },
      { name: 'fidelity:general:surveys-comparison', description: 'Comparativo Pesquisas', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'general') },
      { name: 'fidelity:general:evolution', description: 'Evolução', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'general') },
      { name: 'fidelity:general:benchmarking', description: 'Benchmarking', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'general') },
      { name: 'fidelity:general:multiple-choice', description: 'Multipla Escolha', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'general') },
      { name: 'fidelity:general:word-clouds', description: 'Nuvens de Palavras', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'general') },
      { name: 'dashboard:view', description: 'Visualizar Painel Geral', moduleId: null, submoduleId: null },
      { name: 'fidelity:checkin:dashboard', description: 'Dashboard', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'checkin') },
      { name: 'fidelity:checkin:settings', description: 'Configurações', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'checkin') },
      { name: 'fidelity:checkin:active', description: 'Checkin Ativos', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'checkin') },
      { name: 'checkin:create', description: 'Criar Check-in', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'checkin') },
      { name: 'checkin:edit', description: 'Editar Check-in', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'checkin') },
      { name: 'fidelity:satisfaction:dashboard', description: 'Dashboard', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'satisfaction') },
      { name: 'fidelity:satisfaction:settings', description: 'Configurações', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'satisfaction') },
      { name: 'fidelity:satisfaction:surveys', description: 'Pesquisas', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'satisfaction') },
      { name: 'npsCriteria:view', description: 'Visualizar Critérios NPS', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'satisfaction') },
      { name: 'npsCriteria:edit', description: 'Editar Critérios NPS', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'satisfaction') },
      { name: 'fidelity:responses:dashboard', description: 'Painel', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'responses') },
      { name: 'fidelity:responses:management', description: 'Gestão as Respostas', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'responses') },
      { name: 'fidelity:responses:replicas', description: 'Replicas', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'responses') },
      { name: 'fidelity:responses:goals', description: 'Metas', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'responses') },
      { name: 'fidelity:responses:import', description: 'Importar', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'responses') },
      { name: 'fidelity:relationship:dashboard', description: 'Dashboard', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'relationship') },
      { name: 'fidelity:relationship:ranking', description: 'Ranking de Clientes', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'relationship') },
      { name: 'fidelity:relationship:dispatches', description: 'Disparos', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'relationship') },
      { name: 'fidelity:relationship:campaigns', description: 'Campanhas Automaticas', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'relationship') },
      { name: 'fidelity:relationship:messages', description: 'Mensagens', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'relationship') },
      { name: 'fidelity:relationship:birthdays', description: 'Aniversariantes', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'relationship') },
      { name: 'fidelity:relationship:customers', description: 'Gestão de Clientes', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'relationship') },
      { name: 'fidelity:relationship:segmentation', description: 'Segmentação de Clientes', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'relationship') },
      { name: 'fidelity:coupons:dashboard', description: 'Painel', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'coupons') },
      { name: 'fidelity:coupons:list', description: 'Cupons', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'coupons') },
      { name: 'fidelity:coupons:management', description: 'Gestão de Cupons', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'coupons') },
      { name: 'fidelity:coupons:validation', description: 'Validação', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'coupons') },
      { name: 'fidelity:coupons:raffle', description: 'Sorteio', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'coupons') },
      { name: 'fidelity:coupons:rewards', description: 'Recompensas', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'coupons') },
      { name: 'fidelity:coupons:rewards-management', description: 'Gestão de Recompensas', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'coupons') },
      { name: 'fidelity:coupons:rewards-create', description: 'Cadastro de Recompensas', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'coupons') },
      { name: 'fidelity:coupons:redemption-reports', description: 'Relatorios de Resgate', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'coupons') },
      { name: 'fidelity:automation:flows', description: 'Fluxos', moduleId: null, submoduleId: getSubmoduleId('fidelity', 'automation') },
      { name: 'fidelity:integrations', description: 'Integrações', moduleId: moduleMap['fidelity'], submoduleId: null },
      { name: 'fidelity:reports', description: 'Relatorios', moduleId: moduleMap['fidelity'], submoduleId: null },

      // Stock
      { name: 'stock:dashboard', description: 'Dashboard', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:movements', description: 'Movimentações', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:suppliers', description: 'Fornecedores', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:purchases', description: 'Compras', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:sales', description: 'Vendas', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:products', description: 'Produtos', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:products:create', description: 'Cadastro de Produtos', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:ingredients', description: 'Ingredientes e Insumos', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:settings', description: 'Configurações', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:reports', description: 'Relatorios', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:counting', description: 'Contagem de Estoque', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:inventory', description: 'Inventario', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:technical-sheet:create', description: 'Cadastro', moduleId: null, submoduleId: getSubmoduleId('stock', 'technical-sheet') },
      { name: 'stock:technical-sheet:list', description: 'Fichas Tecnicas', moduleId: null, submoduleId: getSubmoduleId('stock', 'technical-sheet') },
      { name: 'stock:cmv', description: 'CMV', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:adjustments', description: 'Perdas e Ajustes', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:lots', description: 'Lotes e Validades', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:alerts', description: 'Alertas', moduleId: moduleMap['stock'], submoduleId: null },

      // Orders
      { name: 'orders:dashboard', description: 'Painel', moduleId: moduleMap['orders'], submoduleId: null },
      { name: 'orders:pdv', description: 'PDV', moduleId: moduleMap['orders'], submoduleId: null },
      { name: 'orders:list', description: 'Pedidos', moduleId: moduleMap['orders'], submoduleId: null },
      { name: 'orders:integrations', description: 'Integrações', moduleId: moduleMap['orders'], submoduleId: null },
      { name: 'orders:delivery', description: 'Delivery', moduleId: moduleMap['orders'], submoduleId: null },
      { name: 'orders:sales-report', description: 'Relatorio de Vendas', moduleId: moduleMap['orders'], submoduleId: null },
      { name: 'orders:hall:tables', description: 'Mesas', moduleId: null, submoduleId: getSubmoduleId('orders', 'hall') },

      // Management
      { name: 'management:dashboard', description: 'Dashboard', moduleId: moduleMap['management'], submoduleId: null },
      { name: 'management:schedule', description: 'Escala de Funcionarios', moduleId: moduleMap['management'], submoduleId: null },
      { name: 'management:commissions', description: 'Controle de Comissões', moduleId: moduleMap['management'], submoduleId: null },
      { name: 'management:costs', description: 'Custos Fixos e Variaveis', moduleId: moduleMap['management'], submoduleId: null },
      { name: 'management:team', description: 'Equipe', moduleId: moduleMap['management'], submoduleId: null },
      { name: 'management:production', description: 'Produção', moduleId: moduleMap['management'], submoduleId: null },
      { name: 'management:permissions', description: 'Permissões', moduleId: moduleMap['management'], submoduleId: null },

      // CDV
      { name: 'cdv:dashboard', description: 'Painel', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:labels', description: 'Etiquetas', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:labels:print', description: 'Impressão Etiquetas', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:labels:print-group', description: 'Impressão em Grupo', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:labels:count', description: 'Contagem de Etiquetas', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:labels:count-history', description: 'Historico de Contagem', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:labels:history', description: 'Historico de Etiquetas', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:labels:delete', description: 'Exclusão de Etiquetas', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:stock-count', description: 'Contagem de Estoque', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:expirations', description: 'Validades', moduleId: moduleMap['cdv'], submoduleId: null },
      { name: 'cdv:expirations-alert', description: 'Alerta de Validades', moduleId: moduleMap['cdv'], submoduleId: null },

      // Financial
      { name: 'financial:payables:suppliers', description: 'Fornecedores', moduleId: null, submoduleId: getSubmoduleId('financial', 'payables') },
      { name: 'financial:payables:deadlines', description: 'Prazos', moduleId: null, submoduleId: getSubmoduleId('financial', 'payables') },
      { name: 'financial:payables:invoices', description: 'Boletos', moduleId: null, submoduleId: getSubmoduleId('financial', 'payables') },
      { name: 'financial:payables:recurring', description: 'Recorrencia', moduleId: null, submoduleId: getSubmoduleId('financial', 'payables') },
      { name: 'financial:receivables', description: 'Contas a Receber', moduleId: moduleMap['financial'], submoduleId: null },
      { name: 'financial:cash-flow:dashboard', description: 'Painel', moduleId: null, submoduleId: getSubmoduleId('financial', 'cash-flow') },
      { name: 'financial:cash-flow:view', description: 'Visão', moduleId: null, submoduleId: getSubmoduleId('financial', 'cash-flow') },
      { name: 'financial:cash-flow:projection', description: 'Projeção', moduleId: null, submoduleId: getSubmoduleId('financial', 'cash-flow') },
      { name: 'financial:cash-flow:history', description: 'Historico', moduleId: null, submoduleId: getSubmoduleId('financial', 'cash-flow') },
      { name: 'financial:dre:view', description: 'Visão', moduleId: null, submoduleId: getSubmoduleId('financial', 'dre') },
      { name: 'financial:dre:revenue', description: 'Receita', moduleId: null, submoduleId: getSubmoduleId('financial', 'dre') },
      { name: 'financial:dre:cmv', description: 'Custo Variavel (CMV)', moduleId: null, submoduleId: getSubmoduleId('financial', 'dre') },
      { name: 'financial:dre:gross-margin', description: 'Margem Bruta', moduleId: null, submoduleId: getSubmoduleId('financial', 'dre') },
      { name: 'financial:dre:fixed-costs', description: 'Custos Fixos', moduleId: null, submoduleId: getSubmoduleId('financial', 'dre') },
      { name: 'financial:dre:net-profit', description: 'Lucro Liquido', moduleId: null, submoduleId: getSubmoduleId('financial', 'dre') },
      { name: 'financial:payments:methods', description: 'Meio de Pagamentos', moduleId: null, submoduleId: getSubmoduleId('financial', 'payments') },
      { name: 'financial:payments:fees', description: 'Taxas', moduleId: null, submoduleId: getSubmoduleId('financial', 'payments') },
      { name: 'financial:payments:reports', description: 'Relatorios', moduleId: null, submoduleId: getSubmoduleId('financial', 'payments') },
      { name: 'financial:fiscal:invoices', description: 'Notas Fiscais', moduleId: null, submoduleId: getSubmoduleId('financial', 'fiscal') },
      { name: 'financial:fiscal:taxes', description: 'Impostos', moduleId: null, submoduleId: getSubmoduleId('financial', 'fiscal') },
      { name: 'financial:fiscal:sefaz', description: 'Integração SEFAZ', moduleId: null, submoduleId: getSubmoduleId('financial', 'fiscal') },
      { name: 'financial:fiscal:reports', description: 'Relatórios', moduleId: null, submoduleId: getSubmoduleId('financial', 'fiscal') },
      { name: 'financial:fiscal:settings', description: 'Configurações', moduleId: null, submoduleId: getSubmoduleId('financial', 'fiscal') },

      // Settings
      { name: 'settings:view', description: 'Visualizar Configurações', moduleId: moduleMap['settings'], submoduleId: null },
      { name: 'settings:edit', description: 'Editar Configurações', moduleId: moduleMap['settings'], submoduleId: null },
      { name: 'settings:profile:view', description: 'Visualizar Configurações de Perfil', moduleId: moduleMap['settings'], submoduleId: null },
      { name: 'settings:business:view', description: 'Visualizar Configurações da Empresa', moduleId: moduleMap['settings'], submoduleId: null },
      { name: 'settings:security:view', description: 'Visualizar Configurações de Segurança', moduleId: moduleMap['settings'], submoduleId: null },
      { name: 'settings:whatsapp:view', description: 'Visualizar Configurações de WhatsApp', moduleId: moduleMap['settings'], submoduleId: null },
      { name: 'settings:notifications:view', description: 'Visualizar Configurações de Notificações', moduleId: moduleMap['settings'], submoduleId: null },
      { name: 'settings:appearance:view', description: 'Visualizar Configurações de Aparência', moduleId: moduleMap['settings'], submoduleId: null },
      
      // Admin
      // Admin - Users
      { name: 'admin:users:view', description: 'Visualizar Usuários', moduleId: null, submoduleId: getSubmoduleId('admin', 'users') },
      { name: 'admin:users:create', description: 'Criar Usuários', moduleId: null, submoduleId: getSubmoduleId('admin', 'users') },
      { name: 'admin:users:edit', description: 'Editar Usuários', moduleId: null, submoduleId: getSubmoduleId('admin', 'users') },
      { name: 'admin:users:delete', description: 'Excluir Usuários', moduleId: null, submoduleId: getSubmoduleId('admin', 'users') },
      { name: 'admin:restaurants:view', description: 'Visualizar Restaurantes', moduleId: null, submoduleId: getSubmoduleId('admin', 'restaurants') },
      { name: 'admin:restaurants:create', description: 'Criar Restaurantes', moduleId: null, submoduleId: getSubmoduleId('admin', 'restaurants') },
      { name: 'admin:restaurants:edit', description: 'Editar Restaurantes', moduleId: null, submoduleId: getSubmoduleId('admin', 'restaurants') },
      { name: 'admin:restaurants:delete', description: 'Excluir Restaurantes', moduleId: null, submoduleId: getSubmoduleId('admin', 'restaurants') },
      { name: 'admin:permissions:view', description: 'Visualizar Permissões', moduleId: null, submoduleId: getSubmoduleId('admin', 'permissions') },

      // Stock - Products (Example for general resources)
      { name: 'stock:products:view', description: 'Visualizar Produtos', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:products:edit', description: 'Editar Produtos', moduleId: moduleMap['stock'], submoduleId: null },
      { name: 'stock:products:delete', description: 'Excluir Produtos', moduleId: moduleMap['stock'], submoduleId: null },

      // Orders - Categories (Example for general resources)
      { name: 'categories:view', description: 'Visualizar Categorias', moduleId: moduleMap['orders'], submoduleId: null },
      { name: 'categories:create', description: 'Criar Categorias', moduleId: moduleMap['orders'], submoduleId: null },
      { name: 'categories:edit', description: 'Editar Categorias', moduleId: moduleMap['orders'], submoduleId: null },
      { name: 'categories:delete', description: 'Excluir Categorias', moduleId: moduleMap['orders'], submoduleId: null },

    ].map(f => ({ ...f, createdAt: new Date(), updatedAt: new Date() }));
    await queryInterface.bulkInsert('Features', featuresToInsert, { ignoreDuplicates: true });

    // 4. Seed Roles
    const rolesToInsert = [
      { name: 'super_admin', description: 'Acesso total ao sistema.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
      { name: 'owner', description: 'Proprietário do restaurante.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
      { name: 'manager', description: 'Gerente do restaurante.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
      { name: 'waiter', description: 'Garçom.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
    ];
    await queryInterface.bulkInsert('Roles', rolesToInsert, { ignoreDuplicates: true });

    const allRoles = await queryInterface.sequelize.query(`SELECT id, name from "Roles"`);
    const allFeatures = await queryInterface.sequelize.query(`SELECT id, name from "Features"`);

    const roleMap = {};
    allRoles[0].forEach(role => { roleMap[role.name] = role.id; });

    const featureMap = {};
    allFeatures[0].forEach(feature => { featureMap[feature.name] = feature.id; });

    // 5. Seed RoleFeatures
    const roleFeatures = [];
    // super_admin gets all features
    for (const featureName in featureMap) {
        roleFeatures.push({ roleId: roleMap.super_admin, featureId: featureMap[featureName], createdAt: new Date(), updatedAt: new Date() });
    }

    // owner gets fidelity:general:dashboard feature
    if (featureMap['fidelity:general:dashboard']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['fidelity:general:dashboard'], createdAt: new Date(), updatedAt: new Date() });
    }
    // owner also gets dashboard:view feature
    if (featureMap['dashboard:view']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['dashboard:view'], createdAt: new Date(), updatedAt: new Date() });
    }
    // owner also gets restaurant:modules:view feature
    if (featureMap['restaurant:modules:view']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['restaurant:modules:view'], createdAt: new Date(), updatedAt: new Date() });
    }
    // Add new settings features to owner role
    if (featureMap['settings:profile:view']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['settings:profile:view'], createdAt: new Date(), updatedAt: new Date() });
    }
    if (featureMap['settings:business:view']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['settings:business:view'], createdAt: new Date(), updatedAt: new Date() });
    }
    if (featureMap['settings:security:view']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['settings:security:view'], createdAt: new Date(), updatedAt: new Date() });
    }
    if (featureMap['settings:whatsapp:view']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['settings:whatsapp:view'], createdAt: new Date(), updatedAt: new Date() });
    }
    if (featureMap['settings:notifications:view']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['settings:notifications:view'], createdAt: new Date(), updatedAt: new Date() });
    }
    if (featureMap['settings:appearance:view']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['settings:appearance:view'], createdAt: new Date(), updatedAt: new Date() });
    }
    // Add fidelity:coupons:list and fidelity:coupons:rewards to owner role
    if (featureMap['fidelity:coupons:list']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['fidelity:coupons:list'], createdAt: new Date(), updatedAt: new Date() });
    }
    if (featureMap['fidelity:coupons:rewards']) {
      roleFeatures.push({ roleId: roleMap.owner, featureId: featureMap['fidelity:coupons:rewards'], createdAt: new Date(), updatedAt: new Date() });
    }

    await queryInterface.bulkInsert('RoleFeatures', roleFeatures, { ignoreDuplicates: true, returning: false });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('RoleFeatures', null, {});
    await queryInterface.bulkDelete('Features', null, {});
    await queryInterface.bulkDelete('Submodules', null, {});
    await queryInterface.bulkDelete('modules', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};