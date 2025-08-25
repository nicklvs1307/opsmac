import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Components
import Layout from '@/shared/components/Layout/Layout'; // Assuming Layout is a shared component
import ProtectedRoute from '@/shared/components/Auth/ProtectedRoute'; // Assuming ProtectedRoute is a shared component

import Login from '@/features/Auth/Auth/Login';
import Dashboard from '@/features/Dashboard/Dashboard/Dashboard';
import FeedbackList from '@/features/Feedback/Feedback/FeedbackList';
import NewFeedback from '@/features/Feedback/Feedback/NewFeedback';
import FeedbackDetail from '@/features/Feedback/Feedback/FeedbackDetail';
import QRCodeManage from '@/features/QRCode/QRCode/QRCodeManage';
import QRCodeGenerate from '@/features/QRCode/QRCode/QRCodeGenerate';
import Rewards from '@/features/Rewards/Rewards/Rewards';
import Customers from '@/features/Customers/Customers/Customers';
import CouponListPage from '@/features/Coupons/Coupons/CouponListPage';

import CouponValidatorPage from '@/features/Coupons/Coupons/CouponValidatorPage';
import CouponCreatePage from '@/features/Coupons/Coupons/CouponCreatePage';
import CustomerDetail from '@/features/Customers/Customers/CustomerDetail';
import CustomerBirthdays from '@/features/Customers/Customers/CustomerBirthdays';
import CustomerDashboard from '@/features/Customers/Customers/CustomerDashboard';
import Settings from '@/features/Settings/Settings/Settings';
import PublicFeedback from '@/features/Public/Public/PublicFeedback';
import ThankYou from '@/features/Public/Public/ThankYou';
import PublicSurveyForm from '@/features/Public/Public/PublicSurveyForm';
import SurveyList from '@/features/Fidelidade/Fidelidade/Avaliacoes/SurveyList';
import CheckinAnalyticsPage from '@/features/Fidelidade/Fidelidade/Checkin/CheckinAnalyticsPage';
import CheckinSettingsPage from '@/features/Fidelidade/Fidelidade/Checkin/CheckinSettingsPage';
import ActiveCheckinsPage from '@/features/Fidelidade/Fidelidade/Checkin/ActiveCheckinsPage';
import SurveyCreate from '@/features/Fidelidade/Fidelidade/Avaliacoes/SurveyCreate';
import SurveyResults from '@/features/Fidelidade/Fidelidade/Avaliacoes/SurveyResults';
import SurveyEdit from '@/features/Fidelidade/Fidelidade/Avaliacoes/SurveyEdit';
import AdminDashboard from '@/features/Admin/Admin/AdminDashboard';
import SatisfactionAnalyticsPage from '@/features/Fidelidade/Fidelidade/Avaliacoes/SatisfactionAnalyticsPage';
import SatisfactionSettingsPage from '@/features/Fidelidade/Fidelidade/Avaliacoes/SatisfactionSettingsPage';
import RelationshipDashboard from '@/features/Relationship/Relationship/RelationshipDashboard';
import IntegrationsPage from '@/features/Integrations/Integrations/IntegrationsPage';
import PublicCheckin from '@/features/Public/Public/PublicCheckin';
import PublicReward from '@/features/Public/Public/PublicReward';
import GirarRoleta from '@/features/Public/Public/GirarRoleta';
import PublicMenu from '@/features/Public/Public/PublicMenu';
import PublicDeliveryMenu from '@/features/Public/Public/PublicDeliveryMenu';
import PublicDineInMenu from '@/features/Public/Public/PublicDineInMenu';
import CustomerRegistration from '@/features/Public/Public/CustomerRegistration';
import Tables from '@/features/ERP/ERP/Tables';
import TechnicalSpecificationManagement from '@/shared/components/ERP/TechnicalSpecificationManagement'; // Assuming this is a shared component
import StockDashboardPage from '@/features/ERP/ERP/StockDashboardPage';
import StockMovementsPage from '@/features/ERP/ERP/StockMovementsPage';
import SuppliersPage from '@/features/ERP/ERP/SuppliersPage';
import PurchasesPage from '@/features/ERP/ERP/PurchasesPage';
import StockProductsPage from '@/features/ERP/ERP/StockProductsPage';
import Orders from '@/features/ERP/ERP/Orders';
import Pdv from '@/features/ERP/ERP/Pdv';
import Ingredients from '@/features/ERP/ERP/Ingredients';
import Menu from '@/features/ERP/ERP/Menu';
import LabelsDashboard from '@/features/CDV/CDV/Dashboard';
import PrintLabel from '@/features/CDV/CDV/PrintLabel';
import LabelsAdmin from '@/features/CDV/CDV/Admin/index.js';
import StockCountList from '@/features/CDV/CDV/StockCountList';
import StockCountDetail from '@/features/CDV/CDV/StockCountDetail';
import ProductionList from '@/features/CDV/CDV/ProductionList';
import ProductionCreate from '@/features/CDV/CDV/ProductionCreate';
import DeleteLabels from '@/features/CDV/CDV/DeleteLabels';
import Production from '@/features/CDV/CDV/Production';
import CountProducts from '@/features/CDV/CDV/CountProducts';
import CountHistory from '@/features/CDV/CDV/CountHistory';
import FinancialTransactionsPage from '@/features/ERP/ERP/FinancialTransactionsPage';
import CashFlowReport from '@/features/Reports/Reports/CashFlowReport';
import DREReport from '@/features/Reports/Reports/DREReport';
import SalesByPaymentMethodReport from '@/features/Reports/Reports/SalesByPaymentMethodReport';
import ListOfAccountsReport from '@/features/Reports/Reports/ListOfAccountsReport';
import CurrentStockPositionReport from '@/features/Reports/Reports/CurrentStockPositionReport';
import StockPositionHistoryReport from '@/features/Reports/Reports/StockPositionHistoryReport';
import GeneratedCouponsReport from '@/features/Reports/Reports/GeneratedCouponsReport';
import PaymentMethods from '@/features/ERP/ERP/PaymentMethods';
import FinancialCategoriesPage from '@/features/ERP/ERP/FinancialCategoriesPage';
import TeamManagementPage from '@/features/Team/Team/TeamManagementPage';
import WaiterPage from '@/features/Waiter/Waiter/WaiterPage';
import OrderPage from '@/features/Waiter/Waiter/OrderPage';
import ComingSoon from '@/features/Common/Common/ComingSoon';
import RolePermissionManagementPage from '@/shared/components/PermissionManagement/RolePermissionManagementPage'; // Assuming shared
import RestaurantModuleManagementPage from '@/shared/components/PermissionManagement/RestaurantModuleManagementPage'; // Assuming shared
import RestaurantsListPage from '@/features/Admin/Admin/RestaurantsListPage';
import RestaurantDetailPage from '@/features/Admin/Admin/RestaurantDetailPage';
import RoleManagementPage from '@/features/Owner/Owner/RoleManagementPage';
import MonthlySummary from '@/features/Fidelidade/Fidelidade/Geral/MonthlySummary';
import SatisfactionOverview from '@/features/Fidelidade/Fidelidade/Geral/SatisfactionOverview';
import SurveysComparison from '@/features/Fidelidade/Fidelidade/Geral/SurveysComparison';
import Evolution from '@/features/Fidelidade/Fidelidade/Geral/Evolution';
import Benchmarking from '@/features/Fidelidade/Fidelidade/Geral/Benchmarking';
import MultipleChoice from '@/features/Fidelidade/Fidelidade/Geral/MultipleChoice';
import WordClouds from '@/features/Fidelidade/Fidelidade/Geral/WordClouds';
import Raffle from '@/features/Fidelidade/Fidelidade/Cupons/Raffle';
import Replicas from '@/features/Fidelidade/Fidelidade/Respostas/Replicas';
import Goals from '@/features/Fidelidade/Fidelidade/Respostas/Goals';
import Import from '@/features/Fidelidade/Fidelidade/Respostas/Import';
import Ranking from '@/features/Fidelidade/Fidelidade/Relacionamento/Ranking';
import Dispatches from '@/features/Fidelidade/Fidelidade/Relacionamento/Dispatches';
import Campaigns from '@/features/Fidelidade/Fidelidade/Relacionamento/Campaigns';
import Messages from '@/features/Fidelidade/Fidelidade/Relacionamento/Messages';
import Segmentation from '@/features/Fidelidade/Fidelidade/Relacionamento/Segmentation';
import FidelityReports from '@/features/Fidelidade/Fidelidade/Reports';
import ProductsCreate from '@/features/ERP/ERP/Stock/ProductsCreate';
import StockSettings from '@/features/ERP/ERP/Stock/Settings';
import StockReports from '@/features/ERP/ERP/Stock/Reports';
import Inventory from '@/features/ERP/ERP/Stock/Inventory';
import TechnicalSheetCreate from '@/features/ERP/ERP/Stock/TechnicalSheetCreate';
import CMV from '@/features/ERP/ERP/Stock/CMV';
import Adjustments from '@/features/ERP/ERP/Stock/Adjustments';
import Lots from '@/features/ERP/ERP/Stock/Lots';
import Alerts from '@/features/ERP/ERP/Stock/Alerts';
import Integrations from '@/features/ERP/ERP/Orders/Integrations';
import Delivery from '@/features/ERP/ERP/Orders/Delivery';
import SalesReport from '@/features/ERP/ERP/Orders/SalesReport';
import ManagementDashboard from '@/features/Management/Management/Dashboard';
import Schedule from '@/features/Management/Management/Schedule';
import Commissions from '@/features/Management/Management/Commissions';
import Costs from '@/features/Management/Management/Costs';
import ManagementPermissions from '@/features/Management/Management/Permissions';

const NotFound = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/feedback/:shortUrl',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicFeedback />
      </Suspense>
    ),
  },
  {
    path: '/thank-you',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ThankYou />
      </Suspense>
    ),
  },
  {
    path: '/public/surveys/:restaurantSlug/:surveySlug/:customerId?',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicSurveyForm />
      </Suspense>
    ),
  },
  {
    path: '/checkin/public/:restaurantSlug',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicCheckin />
      </Suspense>
    ),
  },
  {
    path: '/girar-roleta',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <GirarRoleta />
      </Suspense>
    ),
  },
  {
    path: '/recompensa-ganha',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicReward />
      </Suspense>
    ),
  },
  {
    path: '/menu/:restaurantSlug',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicMenu />
      </Suspense>
    ),
  },
  {
    path: '/menu/delivery/:restaurantSlug',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicDeliveryMenu />
      </Suspense>
    ),
  },
  {
    path: '/menu/:restaurantSlug/:tableNumber',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicDineInMenu />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <CustomerRegistration />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/monthly-summary',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <MonthlySummary />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/satisfaction-overview',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SatisfactionOverview />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/surveys-comparison',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SurveysComparison />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/evolution',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Evolution />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/benchmarking',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Benchmarking />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/multiple-choice',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <MultipleChoice />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/word-clouds',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <WordClouds />
          </Suspense>
        ),
      },
      {
        path: 'feedback/new',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <NewFeedback />
          </Suspense>
        ),
      },
      {
        path: 'feedback/:id',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <FeedbackDetail />
          </Suspense>
        ),
      },
      {
        path: 'qrcodes',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <QRCodeManage />
          </Suspense>
        ),
      },
      {
        path: 'qrcodes/new',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <QRCodeGenerate />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/coupons/rewards',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Rewards />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/coupons/rewards-management',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Rewards />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/coupons/rewards-create',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CouponCreatePage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/coupons/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CouponListPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/coupons/list',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CouponListPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/coupons/management',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CouponListPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/coupons/validation',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CouponValidatorPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/coupons/raffle',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Raffle />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/relationship/customers',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Customers />
          </Suspense>
        ),
      },
      {
        path: 'customers/:id/details',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CustomerDetail />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/relationship/birthdays',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CustomerBirthdays />
          </Suspense>
        ),
      },
      {
        path: 'customers/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CustomerDashboard />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: 'settings/roles',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <RoleManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'settings/permissions',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <RolePermissionManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/checkin/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CheckinAnalyticsPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/checkin/settings',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CheckinSettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/checkin/active',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ActiveCheckinsPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/satisfaction/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SatisfactionAnalyticsPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/satisfaction/settings',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SatisfactionSettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/satisfaction/surveys',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SurveyList />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/responses/management',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <FeedbackList />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/responses/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <FeedbackList />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/responses/replicas',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Replicas />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/responses/goals',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Goals />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/responses/import',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Import />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/surveys/new',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SurveyCreate />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/surveys/edit/:id',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SurveyEdit />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/surveys/:id/results',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SurveyResults />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/relationship/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <RelationshipDashboard />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/relationship/ranking',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Ranking />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/relationship/dispatches',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Dispatches />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/relationship/campaigns',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Campaigns />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/relationship/messages',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Messages />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/relationship/segmentation',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Segmentation />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/integrations',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <IntegrationsPage />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/reports',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <FidelityReports />
          </Suspense>
        ),
      },
      {
        path: 'erp/menu',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Menu />
          </Suspense>
        ),
      },
      {
        path: 'stock/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <StockDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'stock/movements',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <StockMovementsPage />
          </Suspense>
        ),
      },
      {
        path: 'stock/suppliers',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SuppliersPage />
          </Suspense>
        ),
      },
      {
        path: 'stock/purchases',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <PurchasesPage />
          </Suspense>
        ),
      },
      {
        path: 'stock/products',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <StockProductsPage />
          </Suspense>
        ),
      },
      {
        path: 'stock/technical-sheet/list',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <TechnicalSpecificationManagement />
          </Suspense>
        ),
      },
      {
        path: 'stock/products/create',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ProductsCreate />
          </Suspense>
        ),
      },
      {
        path: 'stock/settings',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <StockSettings />
          </Suspense>
        ),
      },
      {
        path: 'stock/reports',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <StockReports />
          </Suspense>
        ),
      },
      {
        path: 'stock/inventory',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Inventory />
          </Suspense>
        ),
      },
      {
        path: 'stock/technical-sheet/create',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <TechnicalSheetCreate />
          </Suspense>
        ),
      },
      {
        path: 'stock/cmv',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CMV />
          </Suspense>
        ),
      },
      {
        path: 'stock/adjustments',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Adjustments />
          </Suspense>
        ),
      },
      {
        path: 'stock/lots',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Lots />
          </Suspense>
        ),
      },
      {
        path: 'stock/alerts',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Alerts />
          </Suspense>
        ),
      },
      {
        path: 'orders/tables',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Tables />
          </Suspense>
        ),
      },
      {
        path: 'management/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ManagementDashboard />
          </Suspense>
        ),
      },
      {
        path: 'management/schedule',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Schedule />
          </Suspense>
        ),
      },
      {
        path: 'management/commissions',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Commissions />
          </Suspense>
        ),
      },
      {
        path: 'management/costs',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Costs />
          </Suspense>
        ),
      },
      {
        path: 'management/permissions',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ManagementPermissions />
          </Suspense>
        ),
      },
      {
        path: 'orders/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Orders />
          </Suspense>
        ),
      },
      {
        path: 'stock/sales',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Orders />
          </Suspense>
        ),
      },
      {
        path: 'orders/pdv',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Pdv />
          </Suspense>
        ),
      },
      {
        path: 'orders/list',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Orders />
          </Suspense>
        ),
      },
      {
        path: 'orders/integrations',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Integrations />
          </Suspense>
        ),
      },
      {
        path: 'orders/delivery',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Delivery />
          </Suspense>
        ),
      },
      {
        path: 'orders/sales-report',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SalesReport />
          </Suspense>
        ),
      },
      {
        path: 'stock/ingredients',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Ingredients />
          </Suspense>
        ),
      },
      {
        path: 'erp/payment-methods',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <PaymentMethods />
          </Suspense>
        ),
      },
      {
        path: 'erp/financial-transactions',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <FinancialTransactionsPage />
          </Suspense>
        ),
      },
      {
        path: 'erp/financial-categories',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <FinancialCategoriesPage />
          </Suspense>
        ),
      },
      {
        path: 'management/team',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <TeamManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'management/production',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ProductionList />
          </Suspense>
        ),
      },
      {
        path: 'reports/cash-flow',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CashFlowReport />
          </Suspense>
        ),
      },
      {
        path: 'reports/dre',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <DREReport />
          </Suspense>
        ),
      },
      {
        path: 'reports/sales-by-payment-method',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SalesByPaymentMethodReport />
          </Suspense>
        ),
      },
      {
        path: 'reports/list-of-accounts',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ListOfAccountsReport />
          </Suspense>
        ),
      },
      {
        path: 'reports/current-stock-position',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CurrentStockPositionReport />
          </Suspense>
        ),
      },
      {
        path: 'reports/stock-position-history',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <StockPositionHistoryReport />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/coupons/redemption-reports',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <GeneratedCouponsReport />
          </Suspense>
        ),
      },
      {
        path: 'fidelity/automation/flows',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'cdv/dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <LabelsDashboard />
          </Suspense>
        ),
      },
      {
        path: 'cdv/labels/print',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <PrintLabel />
          </Suspense>
        ),
      },
      {
        path: 'cdv/labels/print-group',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'cdv/labels/count',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CountProducts />
          </Suspense>
        ),
      },
      {
        path: 'cdv/labels/count-history',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CountHistory />
          </Suspense>
        ),
      },
      {
        path: 'cdv/labels/history',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'cdv/labels/delete',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <DeleteLabels />
          </Suspense>
        ),
      },
      {
        path: 'cdv/production',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Production />
          </Suspense>
        ),
      },
      {
        path: 'cdv/labels',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <LabelsAdmin />
          </Suspense>
        ),
      },
      {
        path: 'financial/payables/suppliers',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'financial/payables/deadlines',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'financial/payables/invoices',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'financial/payables/recurring',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'cdv/stock-counts/:id',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <StockCountDetail />
          </Suspense>
        ),
      },
      {
        path: 'cdv/stock-counts',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <StockCountList />
          </Suspense>
        ),
      },
      {
        path: 'cdv/productions',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ProductionList />
          </Suspense>
        ),
      },
      {
        path: 'cdv/productions/new',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ProductionCreate />
          </Suspense>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/restaurant-settings',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/modules',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/reports',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/financial',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/stock',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <StockDashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <TechnicalSpecificationManagement />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/coupons',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <CouponListPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/surveys',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <SurveyList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/checkins',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <CheckinAnalyticsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/tables',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <Tables />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/qrcodes',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <QRCodeManage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/waiter-calls',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/whatsapp-messages',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/losses',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/production',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <ProductionList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/suppliers',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <SuppliersPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/roles-permissions',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <RolePermissionManagementPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/restaurant-modules',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <RestaurantModuleManagementPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/restaurants',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <RestaurantsListPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/restaurants/:id',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <RestaurantDetailPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/waiter',
        element: (
          <ProtectedRoute allowedRoles={['waiter']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <WaiterPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/waiter/order/:tableId',
        element: (
          <ProtectedRoute allowedRoles={['waiter']}>
            <Suspense fallback={<div>Carregando...</div>}>
              <OrderPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
