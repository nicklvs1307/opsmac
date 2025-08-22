const authRoutes = require('~/domains/auth/auth.routes');
const feedbackRoutes = require('~/domains/feedback/feedback.routes');
const dashboardRoutes = require('~/domains/dashboard/dashboard.routes');
const rewardsRoutes = require('~/domains/rewards/rewards.routes');
const qrcodeRoutes = require('~/domains/qrcode/qrcode.routes');
const whatsappRoutes = require('~/domains/whatsapp/whatsapp.routes');
const customerRoutes = require('~/domains/customer/customer.routes');
const settingsRoutes = require('~/domains/settings/settings.routes');
const couponsRoutes = require('~/domains/coupons/coupons.routes');
const checkinRoutes = require('~/domains/checkin/checkin.routes');
const publicRoutes = require('~/domains/public/public.routes');
const publicRoutesV2 = require('~/domains/publicV2/publicV2.routes');
const surveyRoutes = require('~/domains/survey/survey.routes');
const publicSurveyRoutes = require('~/domains/publicSurvey/publicSurvey.routes');
const adminRoutes = require('~/domains/admin/admin.routes');
const npsCriteriaRoutes = require('~/domains/npsCriteria/npsCriteria.routes');
const ifoodRoutes = require('~/domains/ifood/ifood.routes');
const googleMyBusinessRoutes = require('~/domains/googleMyBusiness/googleMyBusiness.routes');
const saiposRoutes = require('~/domains/saipos/saipos.routes');
const uaiRangoRoutes = require('~/domains/uaiRango/uaiRango.routes');
const deliveryMuchRoutes = require('~/domains/deliveryMuch/deliveryMuch.routes');
const productRoutes = require('~/domains/products/products.routes');
const publicProductsRoutes = require('~/domains/publicProducts/publicProducts.routes');
const stockRoutes = require('~/domains/stock/stock.routes');
const tablesRoutes = require('~/domains/tables/tables.routes');
const publicDineInMenuRoutes = require('~/domains/publicDineInMenu/publicDineInMenu.routes');
const publicDineInOrdersRoutes = require('~/domains/publicDineInOrders/publicDineInOrders.routes');
const publicOrdersRoutes = require('~/domains/publicOrders/publicOrders.routes');
const ordersRoutes = require('~/domains/orders/orders.routes');
const ingredientsRoutes = require('~/domains/ingredients/ingredients.routes');
const technicalSpecificationsRoutes = require('~/domains/technicalSpecifications/technicalSpecifications.routes');
const categoriesRoutes = require('~/domains/categories/categories.routes');
const addonRoutes = require('~/domains/addons/addons.routes');
const supplierRoutes = require('~/domains/supplier/supplier.routes');
const cashRegisterRoutes = require('~/domains/cashRegister/cashRegister.routes');
const financialRoutes = require('~/domains/financial/financial.routes');
const labelsRoutes = require('~/domains/labels/labels.routes');
const restaurantRoutes = require('~/domains/restaurant/restaurant.routes');
const healthRoutes = require('~/domains/health/health.routes');

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