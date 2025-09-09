const authRoutes = require('domains/auth/auth.routes');
const feedbackRoutes = require('domains/feedback/feedback.routes');
const dashboardRoutes = require('domains/dashboard/dashboard.routes');
const rewardsRoutes = require('domains/rewards/rewards.routes');
const qrcodeRoutes = require('domains/qrcode/qrcode.routes');
const whatsappRoutes = require('domains/whatsapp/whatsapp.routes');
const customerRoutes = require('domains/customer/customer.routes');
const settingsRoutes = require('domains/settings/settings.routes');
const couponsRoutes = require('domains/coupons/coupons.routes');
const checkinRoutes = require('domains/checkin/checkin.routes');
const publicRoutes = require('domains/public/public.routes');
const publicRoutesV2 = require('domains/publicV2/publicV2.routes');
const surveyRoutes = require('domains/survey/survey.routes');
const publicSurveyRoutes = require('domains/publicSurvey/publicSurvey.routes');
const adminRoutes = require('domains/admin/admin.routes');
const npsCriteriaRoutes = require('domains/npsCriteria/npsCriteria.routes');
const ifoodRoutes = require('domains/ifood/ifood.routes');
const googleMyBusinessRoutes = require('domains/googleMyBusiness/googleMyBusiness.routes');
const saiposRoutes = require('domains/saipos/saipos.routes');
const uaiRangoRoutes = require('domains/uaiRango/uaiRango.routes');
const deliveryMuchRoutes = require('domains/deliveryMuch/deliveryMuch.routes');
const productRoutes = require('domains/products/products.routes');


const publicProductsRoutes = require('domains/publicProducts/publicProducts.routes');
const stockRoutes = require('domains/stock/stock.routes');
const tablesRoutes = require('domains/tables/tables.routes');
const publicDineInMenuRoutes = require('domains/publicDineInMenu/publicDineInMenu.routes');
const publicDineInOrdersRoutes = require('domains/publicDineInOrders/publicDineInOrders.routes');
const publicOrdersRoutes = require('domains/publicOrders/publicOrders.routes');
const ordersRoutes = require('domains/orders/orders.routes');
const ingredientsRoutes = require('domains/ingredients/ingredients.routes');
const technicalSpecificationsRoutes = require('domains/technicalSpecifications/technicalSpecifications.routes');
const categoriesRoutes = require('domains/categories/categories.routes');
const addonRoutes = require('domains/addons/addons.routes');
const supplierRoutes = require('domains/supplier/supplier.routes');
const cashRegisterRoutes = require('domains/cashRegister/cashRegister.routes');
const financialRoutes = require('domains/financial/financial.routes');
const labelsRoutes = require('domains/labels/labels.routes');
const restaurantRoutes = require('domains/restaurant/restaurant.routes');
const healthRoutes = require('domains/health/health.routes');

const requirePermission = require('middleware/requirePermission');
const iamRoutes = require('domains/iam/iam.routes');

const getRestaurantContext = require('middleware/getRestaurantContextMiddleware');

// Rewards module explicit dependency injection
const rewardsServiceFactory = require('domains/rewards/rewards.service');
const rewardsControllerFactory = require('domains/rewards/rewards.controller');

// Products module explicit dependency injection
const productsServiceFactory = require('domains/products/products.service');
const productsControllerFactory = require('domains/products/products.controller');

// Public Products module explicit dependency injection
const publicProductsServiceFactory = require('domains/publicProducts/publicProducts.service');
const publicProductsControllerFactory = require('domains/publicProducts/publicProducts.controller');

// Stock module explicit dependency injection
const stockServiceFactory = require('domains/stock/stock.service');
const stockControllerFactory = require('domains/stock/stock.controller');

// Tables module explicit dependency injection
const tablesServiceFactory = require('domains/tables/tables.service');
const tablesControllerFactory = require('domains/tables/tables.controller');

// Public Dine In Menu module explicit dependency injection
const publicDineInMenuServiceFactory = require('domains/publicDineInMenu/publicDineInMenu.service');
const publicDineInMenuControllerFactory = require('domains/publicDineInMenu/publicDineInMenu.controller');

// Public Dine In Orders module explicit dependency injection
const publicDineInOrdersServiceFactory = require('domains/publicDineInOrders/publicDineInOrders.service');
const publicDineInOrdersControllerFactory = require('domains/publicDineInOrders/publicDineInOrders.controller');

// Orders module explicit dependency injection
const ordersServiceFactory = require('domains/orders/orders.service');
const ordersControllerFactory = require('domains/orders/orders.controller');

// Ingredients module explicit dependency injection
const ingredientsServiceFactory = require('domains/ingredients/ingredients.service');
const ingredientsControllerFactory = require('domains/ingredients/ingredients.controller');

// Technical Specifications module explicit dependency injection
const technicalSpecificationsServiceFactory = require('domains/technicalSpecifications/technicalSpecifications.service');
const technicalSpecificationsControllerFactory = require('domains/technicalSpecifications/technicalSpecifications.controller');

// Categories module explicit dependency injection
const categoriesServiceFactory = require('domains/categories/categories.service');
const categoriesControllerFactory = require('domains/categories/categories.controller');

// Addons module explicit dependency injection
const addonsServiceFactory = require('domains/addons/addons.service');
const addonsControllerFactory = require('domains/addons/addons.controller');

// Supplier module explicit dependency injection
const supplierServiceFactory = require('domains/supplier/supplier.service');
const supplierControllerFactory = require('domains/supplier/supplier.controller');

// Cash Register module explicit dependency injection
const cashRegisterServiceFactory = require('domains/cashRegister/cashRegister.service');
const cashRegisterControllerFactory = require('domains/cashRegister/cashRegister.controller');

// Financial module explicit dependency injection
const financialServiceFactory = require('domains/financial/financial.service');
const financialControllerFactory = require('domains/financial/financial.controller');

// Labels module explicit dependency injection
const labelsServiceFactory = require('domains/labels/labels.service');
const labelsControllerFactory = require('domains/labels/labels.controller');

// Restaurant module explicit dependency injection
const restaurantServiceFactory = require('domains/restaurant/restaurant.service');
const restaurantControllerFactory = require('domains/restaurant/restaurant.controller');

// IAM module explicit dependency injection
const iamServiceFactory = require('services/iamService');
const iamControllerFactory = require('domains/iam/iam.controller');

// Health module explicit dependency injection
const healthServiceFactory = require('domains/health/health.service');
const healthControllerFactory = require('domains/health/health.controller');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);

    // Initialize rewardsService and rewardsController here
    const rewardsService = rewardsServiceFactory(db.models);
    const rewardsController = rewardsControllerFactory(rewardsService);

    // Initialize productsService and productsController here
    const productsService = productsServiceFactory(db);
    const productsController = productsControllerFactory(productsService);

    // Initialize publicProductsService and publicProductsController here
    const publicProductsService = publicProductsServiceFactory(db);
    const publicProductsController = publicProductsControllerFactory(publicProductsService);

    // Initialize stockService and stockController here
    const stockService = stockServiceFactory(db);
    const stockController = stockControllerFactory(stockService);

    // Initialize tablesService and tablesController here
    const tablesService = tablesServiceFactory(db);
    const tablesController = tablesControllerFactory(tablesService);

    // Initialize publicDineInMenuService and publicDineInMenuController here
    const publicDineInMenuService = publicDineInMenuServiceFactory(db);
    const publicDineInMenuController = publicDineInMenuControllerFactory(publicDineInMenuService);

    // Initialize publicDineInOrdersService and publicDineInOrdersController here
    const publicDineInOrdersService = publicDineInOrdersServiceFactory(db);
    const publicDineInOrdersController = publicDineInOrdersControllerFactory(publicDineInOrdersService);

    // Initialize ordersService and ordersController here
    const ordersService = ordersServiceFactory(db);
    const ordersController = ordersControllerFactory(ordersService);

    // Initialize ingredientsService and ingredientsController here
    const ingredientsService = ingredientsServiceFactory(db);
    const ingredientsController = ingredientsControllerFactory(ingredientsService);

    // Initialize technicalSpecificationsService and technicalSpecificationsController here
    const technicalSpecificationsService = technicalSpecificationsServiceFactory(db);
    const technicalSpecificationsController = technicalSpecificationsControllerFactory(technicalSpecificationsService);

    // Initialize categoriesService and categoriesController here
    const categoriesService = categoriesServiceFactory(db);
    const categoriesController = categoriesControllerFactory(categoriesService);

    // Initialize addonsService and addonsController here
    const addonsService = addonsServiceFactory(db);
    const addonsController = addonsControllerFactory(addonsService);

    // Initialize supplierService and supplierController here
    const supplierService = supplierServiceFactory(db);
    const supplierController = supplierControllerFactory(supplierService);

    // Initialize cashRegisterService and cashRegisterController here
    const cashRegisterService = cashRegisterServiceFactory(db);
    const cashRegisterController = cashRegisterControllerFactory(cashRegisterService);

    // Initialize financialService and financialController here
    const financialService = financialServiceFactory(db);
    const financialController = financialControllerFactory(financialService);

    // Initialize labelsService and labelsController here
    const labelsService = labelsServiceFactory(db);
    const labelsController = labelsControllerFactory(labelsService);

    // Initialize restaurantService and restaurantController here
    const restaurantService = restaurantServiceFactory(db);
    const restaurantController = restaurantControllerFactory(restaurantService);

    // Initialize iamService and iamController here
    const iamService = iamServiceFactory;
    const iamController = iamControllerFactory(iamService);

    // Initialize healthService and healthController here
    const healthService = healthServiceFactory(db);
    const healthController = healthControllerFactory(healthService);

    

    return [
    { path: '/api/auth', router: authRoutes(db) },
    { path: '/api/feedback', router: feedbackRoutes(db) },
    { path: '/api/dashboard/:restaurantId', middleware: [auth, getRestaurantContext], router: dashboardRoutes(db) },
    { path: '/api/rewards', middleware: [auth, getRestaurantContext], router: rewardsRoutes(db, rewardsController) },
    { path: '/api/qrcode', middleware: [auth, getRestaurantContext], router: qrcodeRoutes(db) },
    { path: '/api/whatsapp', middleware: [auth, getRestaurantContext], router: whatsappRoutes(db) },
    { path: '/api/customers', middleware: [auth, getRestaurantContext], router: customerRoutes(db) },
    { path: '/api/settings', middleware: [auth, getRestaurantContext], router: settingsRoutes(db) },
    { path: '/api/coupons', middleware: [auth, getRestaurantContext], router: couponsRoutes(db) },
    { path: '/api/checkin', middleware: [auth, getRestaurantContext], router: checkinRoutes(db) },
    { path: '/api/public/surveys', router: publicSurveyRoutes(db) },
    { path: '/api/public', router: publicRoutes(db) },
    { path: '/api/public/v2', router: publicRoutesV2(db) },
    { path: '/api/surveys', middleware: [auth, getRestaurantContext], router: surveyRoutes(db) },
    { path: '/api/admin', middleware: [auth, getRestaurantContext], router: adminRoutes(db) },
    { path: '/api/nps-criteria', middleware: [auth, getRestaurantContext], router: npsCriteriaRoutes(db) },
    { path: '/api/ifood', router: ifoodRoutes(db) }, // Webhooks are public
    { path: '/api/google-my-business', router: googleMyBusinessRoutes(db) }, // Webhooks are public
    { path: '/api/saipos', router: saiposRoutes(db) }, // Webhooks are public
    { path: '/api/uai-rango', router: uaiRangoRoutes(db) }, // Webhooks are public
    { path: '/api/delivery-much', router: deliveryMuchRoutes(db) }, // Webhooks are public
    
    { path: '/api/products', middleware: [auth, getRestaurantContext], router: productRoutes(db, productsController) },
    { path: '/api/public/products', router: publicProductsRoutes(db, publicProductsController) },
    { path: '/api/public/orders', router: publicOrdersRoutes(db) },
    { path: '/api/stock', middleware: [auth, getRestaurantContext], router: stockRoutes(db, stockController) },
    { path: '/api/tables', middleware: [auth, getRestaurantContext], router: tablesRoutes(db, tablesController) },
    { path: '/api/public/menu/dine-in', router: publicDineInMenuRoutes(db, publicDineInMenuController) },
    { path: '/api/public/dine-in', router: publicDineInOrdersRoutes(db, publicDineInOrdersController) },
    { path: '/api/orders', middleware: [auth, getRestaurantContext], router: ordersRoutes(db, ordersController) },
    { path: '/api/ingredients', middleware: [auth, getRestaurantContext], router: ingredientsRoutes(db, ingredientsController) },
    { path: '/api/technical-specifications', middleware: [auth, getRestaurantContext], router: technicalSpecificationsRoutes(db, technicalSpecificationsController) },
    { path: '/api/categories', middleware: [auth, getRestaurantContext], router: categoriesRoutes(db, categoriesController) },
    { path: '/api/addons', middleware: [auth, getRestaurantContext], router: addonRoutes(db, addonsController) },
    { path: '/api/suppliers', middleware: [auth, getRestaurantContext], router: supplierRoutes(db, supplierController) },
    { path: '/api/cash-register', middleware: [auth, getRestaurantContext], router: cashRegisterRoutes(db, cashRegisterController) },
    { path: '/api/financial', middleware: [auth, getRestaurantContext], router: financialRoutes(db, financialController) },
    { path: '/api/labels', middleware: [auth, getRestaurantContext], router: labelsRoutes(db, labelsController) },
    { path: '/api/restaurant/:restaurantId', middleware: [auth, getRestaurantContext], router: restaurantRoutes(db, restaurantController) },
    { path: '/api/health', router: healthRoutes(db, healthController) },
    
    { path: '/api/iam', middleware: [auth, getRestaurantContext], router: iamRoutes(db, iamController) },
];
};