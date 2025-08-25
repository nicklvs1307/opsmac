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

module.exports = [
    { path: '/api/auth', router: authRoutes },
    { path: '/api/feedback', router: feedbackRoutes },
    { path: '/api/dashboard/:restaurantId', router: dashboardRoutes, middleware: [checkRestaurantOwnership] },
    { path: '/api/rewards', router: rewardsRoutes },
    { path: '/api/qrcode', router: qrcodeRoutes },
    { path: '/api/whatsapp', router: whatsappRoutes },
    { path: '/api/customers', router: customerRoutes },
    { path: '/api/settings', router: settingsRoutes },
    { path: '/api/coupons', router: couponsRoutes },
    { path: '/api/checkin', router: checkinRoutes },
    { path: '/public/surveys', router: publicSurveyRoutes },
    { path: '/public', router: publicRoutes },
    { path: '/api/public/v2', router: publicRoutesV2 },
    { path: '/api/surveys', router: surveyRoutes },
    { path: '/api/admin', router: adminRoutes },
    { path: '/api/nps-criteria', router: npsCriteriaRoutes },
    { path: '/api/ifood', router: ifoodRoutes },
    { path: '/api/google-my-business', router: googleMyBusinessRoutes },
    { path: '/api/saipos', router: saiposRoutes },
    { path: '/api/uai-rango', router: uaiRangoRoutes },
    { path: '/api/delivery-much', router: deliveryMuchRoutes },
    
    { path: '/api/products', router: productRoutes },
    { path: '/api/public/products', router: publicProductsRoutes },
    { path: '/api/public/orders', router: publicOrdersRoutes },
    { path: '/api/stock', router: stockRoutes },
    { path: '/api/tables', router: tablesRoutes },
    { path: '/public/menu/dine-in', router: publicDineInMenuRoutes },
    { path: '/api/public/dine-in', router: publicDineInOrdersRoutes },
    { path: '/api/orders', router: ordersRoutes },
    { path: '/api/ingredients', router: ingredientsRoutes },
    { path: '/api/technical-specifications', router: technicalSpecificationsRoutes },
    { path: '/api/categories', router: categoriesRoutes },
    { path: '/api/addons', router: addonRoutes },
    { path: '/api/suppliers', router: supplierRoutes },
    { path: '/api/cash-register', router: cashRegisterRoutes },
    { path: '/api/financial', router: financialRoutes },
    { path: '/labels', router: labelsRoutes },
    { path: '/api/restaurant/:restaurantId', router: restaurantRoutes },
    { path: '/api/health', router: healthRoutes },
];