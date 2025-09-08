const authRoutes = require('../src/domains/auth/auth.routes');
const feedbackRoutes = require('../src/domains/feedback/feedback.routes');
const dashboardRoutes = require('../src/domains/dashboard/dashboard.routes');
const rewardsRoutes = require('../src/domains/rewards/rewards.routes');
const qrcodeRoutes = require('../src/domains/qrcode/qrcode.routes');
const whatsappRoutes = require('../src/domains/whatsapp/whatsapp.routes');
const customerRoutes = require('../src/domains/customer/customer.routes');
const settingsRoutes = require('../src/domains/settings/settings.routes');
const couponsRoutes = require('../src/domains/coupons/coupons.routes');
const checkinRoutes = require('../src/domains/checkin/checkin.routes');
const publicRoutes = require('../src/domains/public/public.routes');
const publicRoutesV2 = require('../src/domains/publicV2/publicV2.routes');
const surveyRoutes = require('../src/domains/survey/survey.routes');
const publicSurveyRoutes = require('../src/domains/publicSurvey/publicSurvey.routes');
const adminRoutes = require('../src/domains/admin/admin.routes');
const npsCriteriaRoutes = require('../src/domains/npsCriteria/npsCriteria.routes');
const ifoodRoutes = require('../src/domains/ifood/ifood.routes');
const googleMyBusinessRoutes = require('../src/domains/googleMyBusiness/googleMyBusiness.routes');
const saiposRoutes = require('../src/domains/saipos/saipos.routes');
const uaiRangoRoutes = require('../src/domains/uaiRango/uaiRango.routes');
const deliveryMuchRoutes = require('../src/domains/deliveryMuch/deliveryMuch.routes');
const productRoutes = require('../src/domains/products/products.routes');

const { checkRestaurantOwnership } = require('../src/middleware/checkRestaurantOwnershipMiddleware');
const publicProductsRoutes = require('../src/domains/publicProducts/publicProducts.routes');
const stockRoutes = require('../src/domains/stock/stock.routes');
const tablesRoutes = require('../src/domains/tables/tables.routes');
const publicDineInMenuRoutes = require('../src/domains/publicDineInMenu/publicDineInMenu.routes');
const publicDineInOrdersRoutes = require('../src/domains/publicDineInOrders/publicDineInOrders.routes');
const publicOrdersRoutes = require('../src/domains/publicOrders/publicOrders.routes');
const ordersRoutes = require('../src/domains/orders/orders.routes');
const ingredientsRoutes = require('../src/domains/ingredients/ingredients.routes');
const technicalSpecificationsRoutes = require('../src/domains/technicalSpecifications/technicalSpecifications.routes');
const categoriesRoutes = require('../src/domains/categories/categories.routes');
const addonRoutes = require('../src/domains/addons/addons.routes');
const supplierRoutes = require('../src/domains/supplier/supplier.routes');
const cashRegisterRoutes = require('../src/domains/cashRegister/cashRegister.routes');
const financialRoutes = require('../src/domains/financial/financial.routes');
const labelsRoutes = require('../src/domains/labels/labels.routes');
const restaurantRoutes = require('../src/domains/restaurant/restaurant.routes');
const healthRoutes = require('../src/domains/health/health.routes');

const requirePermission = require('../src/middleware/requirePermission');
const iamRoutes = require('../src/api/routes/iam');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    return [
    { path: '/api/auth', router: authRoutes(db) },
    { path: '/api/feedback', router: feedbackRoutes(db) },
    { path: '/api/dashboard/:restaurantId', router: dashboardRoutes(db) },
    { path: '/api/rewards', router: rewardsRoutes(db) },
    { path: '/api/qrcode', router: qrcodeRoutes(db) },
    { path: '/api/whatsapp', router: whatsappRoutes(db) },
    { path: '/api/customers', router: customerRoutes(db) },
    { path: '/api/settings', router: settingsRoutes(db) },
    { path: '/api/coupons', router: couponsRoutes(db) },
    { path: '/api/checkin', router: checkinRoutes(db) },
    { path: '/api/public/surveys', router: publicSurveyRoutes(db) },
    { path: '/api/public', router: publicRoutes(db) },
    { path: '/api/public/v2', router: publicRoutesV2(db) },
    { path: '/api/surveys', router: surveyRoutes(db) },
    { path: '/api/admin', router: adminRoutes(db) },
    { path: '/api/nps-criteria', router: npsCriteriaRoutes(db) },
    { path: '/api/ifood', router: ifoodRoutes(db) },
    { path: '/api/google-my-business', router: googleMyBusinessRoutes(db) },
    { path: '/api/saipos', router: saiposRoutes(db) },
    { path: '/api/uai-rango', router: uaiRangoRoutes(db) },
    { path: '/api/delivery-much', router: deliveryMuchRoutes(db) },
    
    { path: '/api/products', router: productRoutes(db) },
    { path: '/api/public/products', router: publicProductsRoutes(db) },
    { path: '/api/public/orders', router: publicOrdersRoutes(db) },
    { path: '/api/stock', router: stockRoutes(db) },
    { path: '/api/tables', router: tablesRoutes(db) },
    { path: '/api/public/menu/dine-in', router: publicDineInMenuRoutes(db) },
    { path: '/api/public/dine-in', router: publicDineInOrdersRoutes(db) },
    { path: '/api/orders', router: ordersRoutes(db) },
    { path: '/api/ingredients', router: ingredientsRoutes(db) },
    { path: '/api/technical-specifications', router: technicalSpecificationsRoutes(db) },
    { path: '/api/categories', router: categoriesRoutes(db) },
    { path: '/api/addons', router: addonRoutes(db) },
    { path: '/api/suppliers', router: supplierRoutes(db) },
    { path: '/api/cash-register', router: cashRegisterRoutes(db) },
    { path: '/api/financial', router: financialRoutes(db) },
    { path: '/api/labels', router: labelsRoutes(db) },
    { path: '/api/restaurant/:restaurantId', router: restaurantRoutes(db) },
    { path: '/api/health', router: healthRoutes(db) },
    
    { path: '/api/iam', router: iamRoutes(db) },
];
};