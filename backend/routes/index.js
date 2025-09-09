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
const iamRoutes = require('~/api/routes/iam');

const getRestaurantContext = require('middleware/getRestaurantContextMiddleware');

// Rewards module explicit dependency injection
const rewardsServiceFactory = require('domains/rewards/rewards.service');
const rewardsControllerFactory = require('domains/rewards/rewards.controller');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);

    // Initialize rewardsService and rewardsController here
    const rewardsService = rewardsServiceFactory(db.models);
    const rewardsController = rewardsControllerFactory(rewardsService);

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
    
    { path: '/api/products', middleware: [auth, getRestaurantContext], router: productRoutes(db) },
    { path: '/api/public/products', router: publicProductsRoutes(db) },
    { path: '/api/public/orders', router: publicOrdersRoutes(db) },
    { path: '/api/stock', middleware: [auth, getRestaurantContext], router: stockRoutes(db) },
    { path: '/api/tables', middleware: [auth, getRestaurantContext], router: tablesRoutes(db) },
    { path: '/api/public/menu/dine-in', router: publicDineInMenuRoutes(db) },
    { path: '/api/public/dine-in', router: publicDineInOrdersRoutes(db) },
    { path: '/api/orders', middleware: [auth, getRestaurantContext], router: ordersRoutes(db) },
    { path: '/api/ingredients', middleware: [auth, getRestaurantContext], router: ingredientsRoutes(db) },
    { path: '/api/technical-specifications', middleware: [auth, getRestaurantContext], router: technicalSpecificationsRoutes(db) },
    { path: '/api/categories', middleware: [auth, getRestaurantContext], router: categoriesRoutes(db) },
    { path: '/api/addons', middleware: [auth, getRestaurantContext], router: addonRoutes(db) },
    { path: '/api/suppliers', middleware: [auth, getRestaurantContext], router: supplierRoutes(db) },
    { path: '/api/cash-register', middleware: [auth, getRestaurantContext], router: cashRegisterRoutes(db) },
    { path: '/api/financial', middleware: [auth, getRestaurantContext], router: financialRoutes(db) },
    { path: '/api/labels', middleware: [auth, getRestaurantContext], router: labelsRoutes(db) },
    { path: '/api/restaurant/:restaurantId', middleware: [auth, getRestaurantContext], router: restaurantRoutes(db) },
    { path: '/api/health', router: healthRoutes(db) },
    
    { path: '/api/iam', middleware: [auth, getRestaurantContext], router: iamRoutes(db) },
];
};