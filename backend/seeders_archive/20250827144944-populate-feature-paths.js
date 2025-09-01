'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { Feature } = queryInterface.sequelize.models;

    const pathMap = {
      // Public Routes
      'public:feedback': '/feedback/:shortUrl', // This is a public route, not in the main layout
      'public:thank-you': '/thank-you',
      'public:surveys': '/public/surveys/:restaurantSlug/:surveySlug/:customerId?',
      'public:checkin': '/checkin/public/:restaurantSlug',
      'public:girar-roleta': '/girar-roleta',
      'public:recompensa-ganha': '/recompensa-ganha',
      'public:menu': '/menu/:restaurantSlug',
      'public:menu:delivery': '/menu/delivery/:restaurantSlug',
      'public:menu:dine-in': '/menu/:restaurantSlug/:tableNumber',
      'public:register': '/register',

      // Main App Routes (under '/')
      'dashboard': '/', // Root dashboard
      'fidelity:general:dashboard': '/fidelity/dashboard',
      'fidelity:general:monthly-summary': '/fidelity/monthly-summary',
      'fidelity:general:satisfaction-overview': '/fidelity/satisfaction-overview',
      'fidelity:general:surveys-comparison': '/fidelity/surveys-comparison',
      'fidelity:general:evolution': '/fidelity/evolution',
      'fidelity:general:benchmarking': '/fidelity/benchmarking',
      'fidelity:general:multiple-choice': '/fidelity/multiple-choice',
      'fidelity:general:word-clouds': '/fidelity/word-clouds',
      'feedback:new': '/feedback/new',
      'feedback:view': '/feedback/:id', // Assuming 'feedback:view' maps to this
      'qrcodes:manage': '/qrcodes', // Assuming 'qrcodes:manage' maps to this
      'qrcodes:generate': '/qrcodes/new', // Assuming 'qrcodes:generate' maps to this
      'fidelity:coupons:rewards': '/fidelity/coupons/rewards',
      'fidelity:coupons:rewards-management': '/fidelity/coupons/rewards-management', // Keep for now, but note potential duplication
      'fidelity:coupons:rewards-create': '/fidelity/coupons/rewards-create',
      'fidelity:coupons:dashboard': '/fidelity/coupons/dashboard',
      'fidelity:coupons:list': '/fidelity/coupons/list',
      'fidelity:coupons:management': '/fidelity/coupons/management',
      'fidelity:coupons:validation': '/fidelity/coupons/validation',
      'fidelity:coupons:raffle': '/fidelity/coupons/raffle',
      'fidelity:relationship:customers': '/fidelity/relationship/customers',
      'customers:details': '/customers/:id/details', // Assuming 'customers:details' maps to this
      'fidelity:relationship:birthdays': '/fidelity/relationship/birthdays',
      'customers:dashboard': '/customers/dashboard', // Assuming 'customers:dashboard' maps to this
      'settings:view': '/settings', // Assuming 'settings:view' maps to this
      'settings:edit': '/settings/edit',
      'npsCriteria:view': '/fidelity/satisfaction/nps-criteria',
      'npsCriteria:edit': '/fidelity/satisfaction/nps-criteria/edit',
      'settings:roles': '/settings/roles', // Assuming 'settings:roles' maps to this
      'settings:permissions': '/settings/permissions', // Assuming 'settings:permissions' maps to this
      'fidelity:checkin:dashboard': '/fidelity/checkin/dashboard',
      'fidelity:checkin:settings': '/fidelity/checkin/settings',
      'fidelity:checkin:active': '/fidelity/checkin/active',
      'checkin:create': '/checkin/create',
      'checkin:edit': '/checkin/edit',
      'fidelity:satisfaction:dashboard': '/fidelity/satisfaction/dashboard',
      'fidelity:satisfaction:settings': '/fidelity/satisfaction/settings',
      'fidelity:satisfaction:surveys': '/fidelity/satisfaction/surveys',
      'fidelity:responses:management': '/fidelity/responses/management',
      'fidelity:responses:dashboard': '/fidelity/responses/dashboard',
      'fidelity:responses:replicas': '/fidelity/responses/replicas',
      'fidelity:responses:goals': '/fidelity/responses/goals',
      'fidelity:responses:import': '/fidelity/responses/import',
      'fidelity:surveys:new': '/fidelity/surveys/new',
      'fidelity:surveys:edit': '/fidelity/surveys/edit/:id', // Assuming 'fidelity:surveys:edit' maps to this
      'fidelity:surveys:results': '/fidelity/surveys/:id/results', // Assuming 'fidelity:surveys:results' maps to this
      'fidelity:relationship:dashboard': '/fidelity/relationship/dashboard',
      'fidelity:relationship:ranking': '/fidelity/relationship/ranking',
      'fidelity:relationship:dispatches': '/fidelity/relationship/dispatches',
      'fidelity:relationship:campaigns': '/fidelity/relationship/campaigns',
      'fidelity:relationship:messages': '/fidelity/relationship/messages',
      'fidelity:relationship:segmentation': '/fidelity/relationship/segmentation',
      'fidelity:integrations': '/fidelity/integrations',
      'fidelity:reports': '/fidelity/reports',
      'erp:menu': '/erp/menu', // This is a feature named 'menu' under 'erp' module
      'stock:dashboard': '/stock/dashboard',
      'stock:movements': '/stock/movements',
      'stock:suppliers': '/stock/suppliers',
      'stock:purchases': '/stock/purchases',
      'stock:products': '/stock/products',
      'stock:technical-sheet:list': '/stock/technical-sheet/list',
      'stock:products:create': '/stock/products/create',
      'stock:settings': '/stock/settings',
      'stock:reports': '/stock/reports',
      'stock:inventory': '/stock/inventory',
      'stock:technical-sheet:create': '/stock/technical-sheet/create',
      'stock:cmv': '/stock/cmv',
      'stock:adjustments': '/stock/adjustments',
      'stock:lots': '/stock/lots',
      'stock:alerts': '/stock/alerts',
      'orders:tables': '/orders/tables',
      'management:dashboard': '/management/dashboard',
      'management:schedule': '/management/schedule',
      'management:commissions': '/management/commissions',
      'management:costs': '/management/costs',
      'management:permissions': '/management/permissions',
      'orders:dashboard': '/orders/dashboard',
      'stock:sales': '/stock/sales', // Duplicated path with orders:dashboard, need to clarify
      'orders:pdv': '/orders/pdv',
      'orders:list': '/orders/list',
      'orders:integrations': '/orders/integrations',
      'orders:delivery': '/orders/delivery',
      'orders:sales-report': '/orders/sales-report',
      'stock:ingredients': '/stock/ingredients',
      'erp:payment-methods': '/erp/payment-methods',
      'erp:financial-transactions': '/erp/financial-transactions',
      'erp:financial-categories': '/erp/financial-categories',
      'management:team': '/management/team',
      'management:production': '/management/production',
      'reports:cash-flow': '/reports/cash-flow',
      'reports:dre': '/reports/dre',
      'reports:sales-by-payment-method': '/reports/sales-by-payment-method',
      'reports:list-of-accounts': '/reports/list-of-accounts',
      'reports:current-stock-position': '/reports/current-stock-position',
      'reports:stock-position-history': '/reports/stock-position-history',
      'fidelity:coupons:redemption-reports': '/fidelity/coupons/redemption-reports',
      'fidelity:automation:flows': '/fidelity/automation/flows',
      'cdv:dashboard': '/cdv/dashboard',
      'cdv:labels:print': '/cdv/labels/print',
      'cdv:labels:print-group': '/cdv/labels/print-group',
      'cdv:labels:count': '/cdv/labels/count',
      'cdv:labels:count-history': '/cdv/labels/count-history',
      'cdv:labels:history': '/cdv/labels/history',
      'cdv:labels:delete': '/cdv/labels/delete',
      'cdv:production': '/cdv/production',
      'cdv:labels': '/cdv/labels',
      'financial:payables:suppliers': '/financial/payables/suppliers',
      'financial:payables:deadlines': '/financial/payables/deadlines',
      'financial:payables:invoices': '/financial/payables/invoices',
      'financial:payables:recurring': '/financial/payables/recurring',
      'cdv:stock-counts:details': '/cdv/stock-counts/:id', // Assuming this maps to details
      'cdv:stock-counts': '/cdv/stock-counts',
      'cdv:productions': '/cdv/productions',
      'cdv:productions:new': '/cdv/productions/new',
      'admin:dashboard': '/admin/dashboard', // This is a redirect in frontend, but we need a path for the menu
      'admin:users:view': '/admin/users',
      'admin:restaurant-settings': '/admin/restaurant-settings',
      'admin:modules': '/admin/modules',
      'admin:reports': '/admin/reports',
      'admin:financial': '/admin/financial',
      'admin:stock': '/admin/stock',
      'admin:products': '/admin/products',
      'admin:coupons': '/admin/coupons',
      'admin:surveys': '/admin/surveys',
      'admin:checkins': '/admin/checkins',
      'admin:tables': '/admin/tables',
      'admin:qrcodes': '/admin/qrcodes',
      'admin:waiter-calls': '/admin/waiter-calls',
      'admin:whatsapp-messages': '/admin/whatsapp-messages',
      'admin:losses': '/admin/losses',
      'admin:production': '/admin/production',
      'admin:suppliers': '/admin/suppliers',
      'admin:roles-permissions': '/admin/roles-permissions',
      'admin:restaurant-modules': '/admin/restaurant-modules',
      'admin:restaurants:view': '/admin/restaurants',
      'waiter:dashboard': '/waiter', // Assuming 'waiter:dashboard' maps to this
      'waiter:order': '/waiter/order/:tableId', // Assuming 'waiter:order' maps to this
      'settings:profile:view': '/settings/profile',
      'settings:business:view': '/settings/business',
      'settings:security:view': '/settings/security',
      'settings:whatsapp:view': '/settings/whatsapp',
      'settings:notifications:view': '/settings/notifications',
      'settings:appearance:view': '/settings/appearance',
    };

    for (const featureName in pathMap) {
      const path = pathMap[featureName];
      await queryInterface.sequelize.query(
        `UPDATE "Features" SET path = :path WHERE name = :featureName`,
        {
          replacements: { path, featureName },
          type: Sequelize.QueryTypes.UPDATE,
        }
      );
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `UPDATE "Features" SET path = NULL WHERE path IS NOT NULL`,
      {
        type: Sequelize.QueryTypes.UPDATE,
      }
    );
  }
};
