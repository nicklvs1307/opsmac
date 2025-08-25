'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seed Roles
    const roles = [
      { name: 'super_admin', description: 'Acesso total ao sistema.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
      { name: 'owner', description: 'Proprietário do restaurante com acesso total às configurações do restaurante.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
      { name: 'manager', description: 'Gerente do restaurante com acesso limitado.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
      { name: 'waiter', description: 'Garçom com acesso a funcionalidades de atendimento.', createdAt: new Date(), updatedAt: new Date(), restaurantId: null },
    ];
    await queryInterface.bulkInsert('Roles', roles, {});

    // Get Modules to link with permissions
    const modules = await queryInterface.sequelize.query(
      `SELECT id, name from "modules";`
    );
    const moduleMap = {};
    modules[0].forEach(mod => {
      moduleMap[mod.name.toLowerCase()] = mod.id;
    });

    // Seed Permissions
    const permissions = [
      // System & Role Management (No Module)
      { name: 'admin:access', description: 'Acesso a funcionalidades de Super Admin.', moduleId: null },
      { name: 'role_management:view', description: 'Permite visualizar funções e permissões.', moduleId: null },
      { name: 'role_management:edit', description: 'Permite editar funções e permissões.', moduleId: null },
      { name: 'users:view', description: 'Visualizar usuários do restaurante.', moduleId: null },
      { name: 'users:create', description: 'Criar usuários do restaurante.', moduleId: null },
      { name: 'users:edit', description: 'Editar usuários do restaurante.', moduleId: null },
      { name: 'users:delete', description: 'Deletar usuários do restaurante.', moduleId: null },

      // Module-based permissions
      { name: 'dashboard:view', description: 'Visualizar o dashboard.', moduleId: moduleMap['dashboard'] },
      
      { name: 'addons:view', description: 'Visualizar adicionais.', moduleId: moduleMap['addons'] },
      { name: 'addons:create', description: 'Criar adicionais.', moduleId: moduleMap['addons'] },
      { name: 'addons:edit', description: 'Editar adicionais.', moduleId: moduleMap['addons'] },
      { name: 'addons:delete', description: 'Deletar adicionais.', moduleId: moduleMap['addons'] },

      { name: 'cashRegister:view', description: 'Visualizar o caixa.', moduleId: moduleMap['cashregister'] },
      { name: 'cashRegister:open', description: 'Abrir o caixa.', moduleId: moduleMap['cashregister'] },
      { name: 'cashRegister:close', description: 'Fechar o caixa.', moduleId: moduleMap['cashregister'] },
      { name: 'cashRegister:recordMovement', description: 'Registrar movimentação no caixa.', moduleId: moduleMap['cashregister'] },

      { name: 'categories:view', description: 'Visualizar categorias.', moduleId: moduleMap['categories'] },
      { name: 'categories:create', description: 'Criar categorias.', moduleId: moduleMap['categories'] },
      { name: 'categories:edit', description: 'Editar categorias.', moduleId: moduleMap['categories'] },
      { name: 'categories:delete', description: 'Deletar categorias.', moduleId: moduleMap['categories'] },

      { name: 'checkin:view', description: 'Visualizar check-ins.', moduleId: moduleMap['checkin'] },
      { name: 'checkin:create', description: 'Criar check-ins.', moduleId: moduleMap['checkin'] },
      { name: 'checkin:edit', description: 'Editar check-ins.', moduleId: moduleMap['checkin'] },

      { name: 'coupons:view', description: 'Visualizar cupons.', moduleId: moduleMap['coupons'] },
      { name: 'coupons:create', description: 'Criar cupons.', moduleId: moduleMap['coupons'] },
      { name: 'coupons:edit', description: 'Editar cupons.', moduleId: moduleMap['coupons'] },
      { name: 'coupons:delete', description: 'Deletar cupons.', moduleId: moduleMap['coupons'] },
      { name: 'coupons:redeem', description: 'Resgatar cupons.', moduleId: moduleMap['coupons'] },
      { name: 'coupons:validate', description: 'Validar cupons.', moduleId: moduleMap['coupons'] },

      { name: 'customers:view', description: 'Visualizar clientes.', moduleId: moduleMap['customers'] },
      { name: 'customers:create', description: 'Criar clientes.', moduleId: moduleMap['customers'] },
      { name: 'customers:edit', description: 'Editar clientes.', moduleId: moduleMap['customers'] },
      { name: 'customers:delete', description: 'Deletar clientes.', moduleId: moduleMap['customers'] },

      { name: 'feedback:view', description: 'Visualizar feedbacks.', moduleId: moduleMap['feedback'] },
      { name: 'feedback:create', description: 'Criar feedbacks.', moduleId: moduleMap['feedback'] },
      { name: 'feedback:edit', description: 'Editar feedbacks.', moduleId: moduleMap['feedback'] },
      { name: 'feedback:delete', description: 'Deletar feedbacks.', moduleId: moduleMap['feedback'] },
      { name: 'feedback:respond', description: 'Responder feedbacks.', moduleId: moduleMap['feedback'] },

      { name: 'financial:view', description: 'Visualizar financeiro.', moduleId: moduleMap['financial'] },
      { name: 'financial:create', description: 'Criar transações financeiras.', moduleId: moduleMap['financial'] },
      { name: 'financial:viewReports', description: 'Visualizar relatórios financeiros.', moduleId: moduleMap['financial'] },
      { name: 'financial:managePaymentMethods', description: 'Gerenciar métodos de pagamento.', moduleId: moduleMap['financial'] },

      { name: 'ingredients:view', description: 'Visualizar ingredientes.', moduleId: moduleMap['ingredients'] },
      { name: 'ingredients:create', description: 'Criar ingredientes.', moduleId: moduleMap['ingredients'] },
      { name: 'ingredients:edit', description: 'Editar ingredientes.', moduleId: moduleMap['ingredients'] },
      { name: 'ingredients:delete', description: 'Deletar ingredientes.', moduleId: moduleMap['ingredients'] },

      { name: 'labels:view', description: 'Visualizar etiquetas.', moduleId: moduleMap['labels'] },
      { name: 'labels:print', description: 'Imprimir etiquetas.', moduleId: moduleMap['labels'] },

      { name: 'npsCriteria:view', description: 'Visualizar critérios de NPS.', moduleId: moduleMap['npscriteria'] },
      { name: 'npsCriteria:create', description: 'Criar critérios de NPS.', moduleId: moduleMap['npscriteria'] },
      { name: 'npsCriteria:edit', description: 'Editar critérios de NPS.', moduleId: moduleMap['npscriteria'] },
      { name: 'npsCriteria:delete', description: 'Deletar critérios de NPS.', moduleId: moduleMap['npscriteria'] },

      { name: 'orders:view', description: 'Visualizar pedidos.', moduleId: moduleMap['orders'] },
      { name: 'orders:edit', description: 'Editar pedidos.', moduleId: moduleMap['orders'] },

      { name: 'products:view', description: 'Visualizar produtos.', moduleId: moduleMap['products'] },
      { name: 'products:create', description: 'Criar produtos.', moduleId: moduleMap['products'] },
      { name: 'products:edit', description: 'Editar produtos.', moduleId: moduleMap['products'] },
      { name: 'products:delete', description: 'Deletar produtos.', moduleId: moduleMap['products'] },

      { name: 'qrcodes:view', description: 'Visualizar QR Codes.', moduleId: moduleMap['qrcodes'] },
      { name: 'qrcodes:create', description: 'Criar QR Codes.', moduleId: moduleMap['qrcodes'] },
      { name: 'qrcodes:edit', description: 'Editar QR Codes.', moduleId: moduleMap['qrcodes'] },
      { name: 'qrcodes:delete', description: 'Deletar QR Codes.', moduleId: moduleMap['qrcodes'] },

      { name: 'restaurant:view', description: 'Visualizar dados do restaurante.', moduleId: moduleMap['restaurant'] },
      { name: 'restaurant:edit', description: 'Editar dados do restaurante.', moduleId: moduleMap['restaurant'] },

      { name: 'rewards:view', description: 'Visualizar recompensas.', moduleId: moduleMap['rewards'] },
      { name: 'rewards:create', description: 'Criar recompensas.', moduleId: moduleMap['rewards'] },
      { name: 'rewards:edit', description: 'Editar recompensas.', moduleId: moduleMap['rewards'] },
      { name: 'rewards:delete', description: 'Deletar recompensas.', moduleId: moduleMap['rewards'] },

      { name: 'settings:view', description: 'Visualizar configurações.', moduleId: moduleMap['settings'] },
      { name: 'settings:edit', description: 'Editar configurações.', moduleId: moduleMap['settings'] },

      { name: 'stock:view', description: 'Visualizar estoque.', moduleId: moduleMap['stock'] },
      { name: 'stock:manage', description: 'Gerenciar estoque.', moduleId: moduleMap['stock'] },

      { name: 'suppliers:view', description: 'Visualizar fornecedores.', moduleId: moduleMap['suppliers'] },
      { name: 'suppliers:create', description: 'Criar fornecedores.', moduleId: moduleMap['suppliers'] },
      { name: 'suppliers:edit', description: 'Editar fornecedores.', moduleId: moduleMap['suppliers'] },
      { name: 'suppliers:delete', description: 'Deletar fornecedores.', moduleId: moduleMap['suppliers'] },

      { name: 'surveys:view', description: 'Visualizar pesquisas.', moduleId: moduleMap['surveys'] },
      { name: 'surveys:create', description: 'Criar pesquisas.', moduleId: moduleMap['surveys'] },
      { name: 'surveys:edit', description: 'Editar pesquisas.', moduleId: moduleMap['surveys'] },
      { name: 'surveys:delete', description: 'Deletar pesquisas.', moduleId: moduleMap['surveys'] },

      { name: 'tables:view', description: 'Visualizar mesas.', moduleId: moduleMap['tables'] },
      { name: 'tables:create', description: 'Criar mesas.', moduleId: moduleMap['tables'] },
      { name: 'tables:edit', description: 'Editar mesas.', moduleId: moduleMap['tables'] },
      { name: 'tables:delete', description: 'Deletar mesas.', moduleId: moduleMap['tables'] },

      { name: 'technicalSpecifications:view', description: 'Visualizar fichas técnicas.', moduleId: moduleMap['technicalspecifications'] },
      { name: 'technicalSpecifications:create', description: 'Criar fichas técnicas.', moduleId: moduleMap['technicalspecifications'] },
      { name: 'technicalSpecifications:edit', description: 'Editar fichas técnicas.', moduleId: moduleMap['technicalspecifications'] },
      { name: 'technicalSpecifications:delete', description: 'Deletar fichas técnicas.', moduleId: moduleMap['technicalspecifications'] },

      { name: 'whatsapp:view', description: 'Visualizar mensagens do WhatsApp.', moduleId: moduleMap['whatsapp'] },
      { name: 'whatsapp:send', description: 'Enviar mensagens pelo WhatsApp.', moduleId: moduleMap['whatsapp'] },
      { name: 'whatsapp:sendBulk', description: 'Enviar mensagens em massa pelo WhatsApp.', moduleId: moduleMap['whatsapp'] },

      // Waiter-specific permissions
      { name: 'waiter:createOrder', description: 'Criar pedidos (garçom).', moduleId: moduleMap['orders'] },
      { name: 'waiter:editOrder', description: 'Editar pedidos (garçom).', moduleId: moduleMap['orders'] },
      { name: 'waiter:viewOrder', description: 'Visualizar pedidos (garçom).', moduleId: moduleMap['orders'] },
      { name: 'waiter:createCall', description: 'Chamar o garçom.', moduleId: moduleMap['tables'] },
      { name: 'waiter:editCall', description: 'Gerenciar chamados de garçom.', moduleId: moduleMap['tables'] },
      { name: 'waiter:viewCall', description: 'Visualizar chamados de garçom.', moduleId: moduleMap['tables'] },
      { name: 'waiter:deleteCall', description: 'Deletar chamados de garçom.', moduleId: moduleMap['tables'] },

      // Integration permissions
      { name: 'deliveryMuch:view', description: 'Visualizar pedidos do Delivery Much.', moduleId: moduleMap['deliverymuch'] },
      { name: 'googleMyBusiness:manage', description: 'Gerenciar integração com Google Meu Negócio.', moduleId: moduleMap['googlemybusiness'] },
      { name: 'googleMyBusiness:view', description: 'Visualizar dados do Google Meu Negócio.', moduleId: moduleMap['googlemybusiness'] },
      { name: 'saipos:view', description: 'Visualizar pedidos da Saipos.', moduleId: moduleMap['saipos'] },
      { name: 'uaiRango:view', description: 'Visualizar pedidos do UaiRango.', moduleId: moduleMap['uairango'] },

    ].map(p => ({ ...p, createdAt: new Date(), updatedAt: new Date() }));

    await queryInterface.bulkInsert('Permissions', permissions, {});

    const allRoles = await queryInterface.sequelize.query(`SELECT id, name from "Roles"`);
    const allPermissions = await queryInterface.sequelize.query(`SELECT id, name from "Permissions"`);

    const roleMap = {};
    allRoles[0].forEach(role => { roleMap[role.name] = role.id; });

    const permissionMap = {};
    allPermissions[0].forEach(permission => { permissionMap[permission.name] = permission.id; });

    const ownerPermissions = Object.keys(permissionMap).filter(p => !p.startsWith('admin:'));
    const managerPermissions = [
        'dashboard:view', 'products:view', 'products:edit', 'stock:view', 'orders:view', 'orders:edit', 'customers:view', 'checkin:view', 'tables:view', 'cashRegister:view', 'cashRegister:open', 'cashRegister:close', 'cashRegister:recordMovement', 'feedback:view', 'feedback:respond', 'qrcodes:view', 'whatsapp:view'
    ];
    const waiterPermissions = [
        'waiter:createOrder', 'waiter:editOrder', 'waiter:viewOrder', 'waiter:createCall', 'waiter:editCall', 'waiter:viewCall', 'waiter:deleteCall', 'tables:view'
    ];

    const rolePermissions = [];

    // Super Admin gets all permissions
    for (const permName in permissionMap) {
        rolePermissions.push({ roleId: roleMap.super_admin, permissionId: permissionMap[permName], createdAt: new Date(), updatedAt: new Date() });
    }

    // Owner gets all permissions except super admin ones
    ownerPermissions.forEach(permName => {
        if(permissionMap[permName]) rolePermissions.push({ roleId: roleMap.owner, permissionId: permissionMap[permName], createdAt: new Date(), updatedAt: new Date() });
    });

    // Manager gets a specific subset
    managerPermissions.forEach(permName => {
        if(permissionMap[permName]) rolePermissions.push({ roleId: roleMap.manager, permissionId: permissionMap[permName], createdAt: new Date(), updatedAt: new Date() });
    });

    // Waiter gets a very specific subset
    waiterPermissions.forEach(permName => {
        if(permissionMap[permName]) rolePermissions.push({ roleId: roleMap.waiter, permissionId: permissionMap[permName], createdAt: new Date(), updatedAt: new Date() });
    });

    await queryInterface.bulkInsert('RolePermissions', rolePermissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('RolePermissions', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};