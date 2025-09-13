import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Components
import Layout from '@/components/Layout/Layout'; // Assuming Layout is a shared component
import ProtectedRoute from '@/components/Auth/ProtectedRoute'; // Assuming ProtectedRoute is a shared component

import Login from '@/features/Auth/Auth/Login';
import Dashboard from '@/features/Dashboard/Dashboard';
import FeedbackList from '@/features/Feedback/FeedbackList';
import NewFeedback from '@/features/Feedback/NewFeedback';
import FeedbackDetail from '@/features/Feedback/FeedbackDetail';
import QRCodeManage from '@/features/QRCode/QRCodeManage';
import QRCodeGenerate from '@/features/QRCode/QRCodeGenerate';
import Rewards from '@/features/Rewards/Rewards';
import Customers from '@/features/Customers/Customers';
import CouponListPage from '@/features/Coupons/CouponListPage';

import CouponValidatorPage from '@/features/Coupons/CouponValidatorPage';
import CouponCreatePage from '@/features/Coupons/CouponCreatePage';
import CouponEditPage from '@/features/Coupons/CouponEditPage'; // New Import
import CouponDashboardPage from '@/features/Coupons/CouponDashboardPage'; // New Import
import CustomerDetail from '@/features/Customers/CustomerDetail';
import CustomerBirthdays from '@/features/Customers/CustomerBirthdays';
import CustomerDashboard from '@/features/Customers/CustomerDashboard';
// import Settings from '@/features/Settings/Settings'; // Original Settings component
import PublicFeedback from '@/features/Public/PublicFeedback';
import ThankYou from '@/features/Public/ThankYou';
import PublicSurveyForm from '@/features/Public/PublicSurveyForm';

import CheckinAnalyticsPage from '@/features/Fidelidade/Checkin/CheckinAnalyticsPage';
import CheckinSettingsPage from '@/features/Fidelidade/Checkin/CheckinSettingsPage';
import ActiveCheckinsPage from '@/features/Fidelidade/Checkin/ActiveCheckinsPage';
import SurveyCreate from '@/features/Fidelidade/Avaliacoes/SurveyCreate';
import SurveyResults from '@/features/Fidelidade/Avaliacoes/SurveyResults';
import SurveyEdit from '@/features/Fidelidade/Avaliacoes/SurveyEdit';
import SurveyList from '@/features/Fidelidade/Avaliacoes/SurveyList';

import AdminUsersPage from '@/features/Admin/AdminUsersPage';
import AdminRestaurantsPage from '@/features/Admin/AdminRestaurantsPage';
import RestaurantEditPage from '@/features/Admin/RestaurantEditPage';
import MenuManagement from '@/features/Admin/MenuManagement'; // Added import
import RestaurantCreatePage from '@/features/Admin/RestaurantCreatePage';
import UserEditPage from '@/features/Admin/UserEditPage';
import UserCreatePage from '@/features/Admin/UserCreatePage';
import SatisfactionAnalyticsPage from '@/features/Fidelidade/Avaliacoes/SatisfactionAnalyticsPage';
import SatisfactionSettingsPage from '@/features/Fidelidade/Avaliacoes/SatisfactionSettingsPage';
import RelationshipDashboard from '@/features/Relationship/RelationshipDashboard';

import IntegrationsPage from '@/features/Integrations/IntegrationsPage';
import PublicCheckin from '@/features/Public/PublicCheckin';
import PublicReward from '@/features/Public/PublicReward';
import GirarRoleta from '@/features/Public/GirarRoleta';
import PublicMenu from '@/features/Public/PublicMenu';
import PublicDeliveryMenu from '@/features/Public/PublicDeliveryMenu';
import PublicDineInMenu from '@/features/Public/DineInMenu';
import CustomerRegistration from '@/features/Public/CustomerRegistration';
import Tables from '@/features/ERP/Tables';
import TechnicalSpecificationManagement from '@/components/ERP/TechnicalSpecificationManagement'; // Assuming this is a shared component
import StockDashboardPage from '@/features/ERP/StockDashboardPage';
import StockMovementsPage from '@/features/ERP/StockMovementsPage';
import SuppliersPage from '@/features/ERP/SuppliersPage';
import PurchasesPage from '@/features/ERP/PurchasesPage';
import StockProductsPage from '@/features/ERP/StockProductsPage';
import Orders from '@/features/ERP/Orders';
import Pdv from '@/features/ERP/Pdv';
import Ingredients from '@/features/ERP/Ingredients';
import Menu from '@/features/ERP/Menu';
import LabelsDashboard from '@/features/CDV/Dashboard';
import PrintLabel from '@/features/CDV/PrintLabel';
import LabelsAdmin from '@/features/CDV/Admin';
import StockCountList from '@/features/CDV/StockCountList';
import StockCountDetail from '@/features/CDV/StockCountDetail';
import ProductionList from '@/features/CDV/ProductionList';
import ProductionCreate from '@/features/CDV/ProductionCreate';
import DeleteLabels from '@/features/CDV/DeleteLabels';
import Production from '@/features/CDV/Production';
import CountProducts from '@/features/CDV/CountProducts';
import CountHistory from '@/features/CDV/CountHistory';

import CashFlowReport from '@/features/Reports/CashFlowReport';
import DREReport from '@/features/Reports/DREReport';
import SalesByPaymentMethodReport from '@/features/Reports/SalesByPaymentMethodReport';
import ListOfAccountsReport from '@/features/Reports/ListOfAccountsReport';
import CurrentStockPositionReport from '@/features/Reports/CurrentStockPositionReport';
import StockPositionHistoryReport from '@/features/Reports/StockPositionHistoryReport';
import GeneratedCouponsReport from '@/features/Reports/GeneratedCouponsReport';
import PaymentMethods from '@/features/ERP/PaymentMethods';
import FinancialCategoriesPage from '@/features/ERP/FinancialCategoriesPage';
import TeamManagementPage from '@/features/Team/TeamManagementPage';
import WaiterPage from '@/features/Waiter/WaiterPage';
import OrderPage from '@/features/Waiter/OrderPage';
import ComingSoon from '@/features/Common/ComingSoon';
import RolePermissionManagementPage from '@/components/Admin/RolePermissionManagementPage'; // Assuming shared

import IAMDashboard from '@/features/IAM/IAMDashboard';
import RoleManagement from '@/features/IAM/RoleManagement';
import RolePermissions from '@/features/IAM/RolePermissions';
import UserPermissionOverrides from '@/features/IAM/UserPermissionOverrides';
import EntitlementManagement from '@/features/IAM/EntitlementManagement';
import UserRoleManagement from '@/features/IAM/UserRoleManagement';

import MonthlySummary from '@/features/Fidelidade/Geral/MonthlySummary';
import SatisfactionOverview from '@/features/Fidelidade/Geral/SatisfactionOverview';
import SurveysComparison from '@/features/Fidelidade/Geral/SurveysComparison';
import Evolution from '@/features/Fidelidade/Geral/Evolution';
import Benchmarking from '@/features/Fidelidade/Geral/Benchmarking';
import MultipleChoice from '@/features/Fidelidade/Geral/MultipleChoice';
import WordClouds from '@/features/Fidelidade/Geral/WordClouds';
import Raffle from '@/features/Fidelidade/Cupons/Raffle';
import Replicas from '@/features/Fidelidade/Respostas/Replicas';
import Goals from '@/features/Fidelidade/Respostas/Goals';
import Import from '@/features/Fidelidade/Respostas/Import';
import Ranking from '@/features/Fidelidade/Relacionamento/Ranking';
import Dispatches from '@/features/Fidelidade/Relacionamento/Dispatches';
import Campaigns from '@/features/Fidelidade/Relacionamento/Campaigns';
import Messages from '@/features/Fidelidade/Relacionamento/Messages';
import Segmentation from '@/features/Fidelidade/Relacionamento/Segmentation';
import FidelityReports from '@/features/Fidelidade/Reports';
import ProductsCreate from '@/features/ERP/Stock/ProductsCreate';
import StockSettings from '@/features/ERP/Stock/Settings';
import StockReports from '@/features/ERP/Stock/Reports';
import Inventory from '@/features/ERP/Stock/Inventory';
import TechnicalSheetCreate from '@/features/ERP/Stock/TechnicalSheetCreate';
import CMV from '@/features/ERP/Stock/CMV';
import Adjustments from '@/features/ERP/Stock/Adjustments';
import Lots from '@/features/ERP/Stock/Lots';
import Alerts from '@/features/ERP/Stock/Alerts';
import Integrations from '@/features/ERP/Orders/Integrations';
import Delivery from '@/features/ERP/Orders/Delivery';
import SalesReport from '@/features/ERP/Orders/SalesReport';
import ManagementDashboard from '@/features/Management/Dashboard';
import Schedule from '@/features/Management/Schedule';
import Commissions from '@/features/Management/Commissions';
import Costs from '@/features/Management/Costs';
import ManagementPermissions from '@/features/Management/Permissions';

// New Settings Page Imports
import Settings from '@/features/Settings/Settings'; // Keep this for the redirect
import ProfileSettingsPage from '@/features/Settings/pages/ProfileSettingsPage';
import BusinessSettingsPage from '@/features/Settings/pages/BusinessSettingsPage';
import NotificationsSettingsPage from '@/features/Settings/pages/NotificationsSettingsPage';
import SecuritySettingsPage from '@/features/Settings/pages/SecuritySettingsPage';
import AppearanceSettingsPage from '@/features/Settings/pages/AppearanceSettingsPage';
import WhatsappSettingsPage from '@/features/Settings/pages/WhatsappSettingsPage';

// New Digital Menus Page Import
import DeliveryMenuPage from '@/features/Orders/DigitalMenus/DeliveryMenuPage';

import UnauthorizedPage from '@/features/Common/UnauthorizedPage';
import FeatureLockedPage from '@/features/Common/FeatureLockedPage';

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
    path: '/unauthorized',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: '/feature-locked',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <FeatureLockedPage />
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
          <ProtectedRoute featureKey="dashboard" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/monthly-summary',
        element: (
          <ProtectedRoute featureKey="loyalty_reports" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <MonthlySummary />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/satisfaction-overview',
        element: (
          <ProtectedRoute featureKey="satisfaction_reports" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <SatisfactionOverview />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/surveys-comparison',
        element: (
          <ProtectedRoute featureKey="fidelity:general:surveys-comparison" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <SurveysComparison />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/evolution',
        element: (
          <ProtectedRoute featureKey="loyalty_reports" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <Evolution />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/benchmarking',
        element: (
          <ProtectedRoute featureKey="loyalty_reports" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <Benchmarking />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/multiple-choice',
        element: (
          <ProtectedRoute featureKey="fidelity:general:surveys-comparison" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <MultipleChoice />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/word-clouds',
        element: (
          <ProtectedRoute featureKey="feedback_reports" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <WordClouds />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'feedback/new',
        element: (
          <ProtectedRoute featureKey="feedback_management" actionKey="create">
            <Suspense fallback={<div>Carregando...</div>}>
              <NewFeedback />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'feedback/:id',
        element: (
          <ProtectedRoute featureKey="feedback_management" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <FeedbackDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'qrcodes',
        element: (
          <ProtectedRoute featureKey="qrcodes" actionKey="manage">
            <Suspense fallback={<div>Carregando...</div>}>
              <QRCodeManage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'qrcodes/new',
        element: (
          <ProtectedRoute featureKey="qrcodes" actionKey="create">
            <Suspense fallback={<div>Carregando...</div>}>
              <QRCodeGenerate />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/coupons/rewards',
        element: (
          <ProtectedRoute featureKey="rewards_management" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <Rewards />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/coupons/rewards-management',
        element: (
          <ProtectedRoute featureKey="rewards_management" actionKey="manage">
            <Suspense fallback={<div>Carregando...</div>}>
              <Rewards />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/coupons/rewards-create',
        element: (
          <ProtectedRoute featureKey="coupons_management" actionKey="create">
            <Suspense fallback={<div>Carregando...</div>}>
              <CouponCreatePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/coupons/edit/:id', // New route for editing coupons
        element: (
          <ProtectedRoute featureKey="coupons_management" actionKey="update">
            <Suspense fallback={<div>Carregando...</div>}>
              <CouponEditPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/coupons/dashboard',
        element: (
          <ProtectedRoute featureKey="coupons_management" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <CouponDashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/coupons/list',
        element: (
          <ProtectedRoute featureKey="coupons_management" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <CouponListPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/coupons/management',
        element: (
          <ProtectedRoute featureKey="coupons_management" actionKey="manage">
            <Suspense fallback={<div>Carregando...</div>}>
              <CouponListPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/coupons/validation',
        element: (
          <ProtectedRoute featureKey="coupons_management" actionKey="update">
            <Suspense fallback={<div>Carregando...</div>}>
              <CouponValidatorPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/coupons/raffle',
        element: (
          <ProtectedRoute featureKey="raffle" actionKey="participate">
            <Suspense fallback={<div>Carregando...</div>}>
              <Raffle />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/relationship/customers',
        element: (
          <ProtectedRoute featureKey="customer_management" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <Customers />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'customers/:id/details',
        element: (
          <ProtectedRoute featureKey="customer_management" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <CustomerDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/relationship/birthdays',
        element: (
          <ProtectedRoute featureKey="customer_management" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <CustomerBirthdays />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'customers/dashboard',
        element: (
          <ProtectedRoute featureKey="customer_management" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <CustomerDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            {/* Settings component now acts as a redirect */}
            <Settings />
          </Suspense>
        ),
        children: [
          {
            index: true, // Default child route for /settings
            element: <Settings />,
          },
          {
            path: 'profile',
            element: (
              <ProtectedRoute featureKey="user_profile" actionKey="update">
                <Suspense fallback={<div>Carregando...</div>}>
                  <ProfileSettingsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'business',
            element: (
              <ProtectedRoute featureKey="business_settings" actionKey="update">
                <Suspense fallback={<div>Carregando...</div>}>
                  <BusinessSettingsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'notifications',
            element: (
              <ProtectedRoute featureKey="notification_settings" actionKey="update">
                <Suspense fallback={<div>Carregando...</div>}>
                  <NotificationsSettingsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'security',
            element: (
              <ProtectedRoute featureKey="security_settings" actionKey="update">
                <Suspense fallback={<div>Carregando...</div>}>
                  <SecuritySettingsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'appearance',
            element: (
              <ProtectedRoute featureKey="appearance_settings" actionKey="update">
                <Suspense fallback={<div>Carregando...</div>}>
                  <AppearanceSettingsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'whatsapp',
            element: (
              <ProtectedRoute featureKey="whatsapp_integration" actionKey="update">
                <Suspense fallback={<div>Carregando...</div>}>
                  <WhatsappSettingsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          // NPS Criteria route is intentionally omitted
        ],
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
          <ProtectedRoute featureKey="fidelity:checkin:active" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <ActiveCheckinsPage />
            </Suspense>
          </ProtectedRoute>
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
        path: 'integrations',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Integrations />
          </Suspense>
        ),
      },
      {
        path: 'delivery',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Delivery />
          </Suspense>
        ),
      },
      {
        path: 'sales-report',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SalesReport />
          </Suspense>
        ),
      },
      {
        path: 'digital-menus/delivery',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <DeliveryMenuPage />
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
        path: 'orders',
        children: [
          {
            index: true, // Default child route for /orders
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <Orders />
              </Suspense>
            ),
          },
          {
            path: 'pdv',
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <Pdv />
              </Suspense>
            ),
          },
          {
            path: 'list',
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <Orders />
              </Suspense>
            ),
          },
          {
            path: 'integrations',
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <Integrations />
              </Suspense>
            ),
          },
          {
            path: 'delivery',
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <Delivery />
              </Suspense>
            ),
          },
          {
            path: 'sales-report',
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <SalesReport />
              </Suspense>
            ),
          },
          {
            path: 'digital-menus/delivery',
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <DeliveryMenuPage />
              </Suspense>
            ),
          },
          // Placeholder for dine-in menu
          // {
          //   path: 'digital-menus/dine-in',
          //   element: <Suspense fallback={<div>Carregando...</div>}><DineInMenuPage /></Suspense>,
          // },
        ],
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
        path: 'financial/receivables',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'financial/fiscal/invoices',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'financial/fiscal/taxes',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'financial/fiscal/sefaz',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'financial/fiscal/reports',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'financial/fiscal/settings',
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
        path: 'cdv/expirations',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'cdv/expirations-alert',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ComingSoon />
          </Suspense>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute featureKey="admin_panel" actionKey="access">
            <Navigate to="/admin/users" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/restaurant-settings',
        element: (
          <ProtectedRoute featureKey="restaurant_management" actionKey="update">
            <Suspense fallback={<div>Carregando...</div>}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/modules',
        element: (
          <ProtectedRoute featureKey="modules" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <MenuManagement />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/reports',
        element: (
          <ProtectedRoute featureKey="reports" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />{' '}
              {/* Keep ComingSoon for now if no specific report component is ready */}
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/financial',
        element: (
          <ProtectedRoute featureKey="financial" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon /> {/* Placeholder for FinancialTransactionsPage */}
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/stock',
        element: (
          <ProtectedRoute featureKey="stock" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <StockDashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute featureKey="products" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <StockProductsPage /> {/* Assuming this is the main products page */}
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/coupons',
        element: (
          <ProtectedRoute featureKey="coupons" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <CouponListPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/surveys',
        element: (
          <ProtectedRoute featureKey="surveys" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <SurveyList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fidelity/checkin/analytics',
        element: (
          <ProtectedRoute featureKey="checkin_dashboard" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <CheckinAnalyticsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'erp/tables',
        element: (
          <ProtectedRoute featureKey="tables" actionKey="manage">
            <Suspense fallback={<div>Carregando...</div>}>
              <Tables />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'qrcodes/manage',
        element: (
          <ProtectedRoute featureKey="qrcodes" actionKey="manage">
            <Suspense fallback={<div>Carregando...</div>}>
              <QRCodeManage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'waiter/calls',
        element: (
          <ProtectedRoute featureKey="waiter_calls" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'whatsapp/messages',
        element: (
          <ProtectedRoute featureKey="whatsapp_messages" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/losses',
        element: (
          <ProtectedRoute featureKey="losses" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <ComingSoon />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // {
      //   path: 'admin/production',
      //   element: (
      //     <Suspense fallback={<div>Carregando...</div>}>
      //       <ProductionList />
      //     </Suspense>
      //   ),
      // },
      {
        path: 'admin/suppliers',
        element: (
          <ProtectedRoute featureKey="suppliers" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <SuppliersPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/roles-permissions',
        element: (
          <ProtectedRoute featureKey="role_management" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <RolePermissionManagementPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/restaurant-modules',
        element: (
          <ProtectedRoute featureKey="modules" actionKey="manage">
            <Suspense fallback={<div>Carregando...</div>}>
              <MenuManagement />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute featureKey="admin_panel" actionKey="access">
            <Navigate to="/admin/users" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute featureKey="users" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <AdminUsersPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users/:userId/edit',
        element: (
          <ProtectedRoute featureKey="users" actionKey="update">
            <Suspense fallback={<div>Carregando...</div>}>
              <UserEditPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users/new',
        element: (
          <ProtectedRoute featureKey="users" actionKey="create">
            <Suspense fallback={<div>Carregando...</div>}>
              <UserCreatePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/restaurants',
        element: (
          <ProtectedRoute featureKey="restaurants" actionKey="read">
            <Suspense fallback={<div>Carregando...</div>}>
              <AdminRestaurantsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/restaurants/:restaurantId/edit',
        element: (
          <ProtectedRoute featureKey="restaurants" actionKey="update">
            <Suspense fallback={<div>Carregando...</div>}>
              <RestaurantEditPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/restaurants/new',
        element: (
          <ProtectedRoute featureKey="restaurants" actionKey="create">
            <Suspense fallback={<div>Carregando...</div>}>
              <RestaurantCreatePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/waiter',
        element: (
          <ProtectedRoute featureKey="waiter_app" actionKey="access">
            <Suspense fallback={<div>Carregando...</div>}>
              <WaiterPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/waiter/order/:tableId',
        element: (
          <ProtectedRoute featureKey="waiter_app" actionKey="access">
            <Suspense fallback={<div>Carregando...</div>}>
              <OrderPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/admin/iam/:restaurantId',
    element: (
      <ProtectedRoute featureKey="iam_admin" actionKey="access">
        <Suspense fallback={<div>Carregando...</div>}>
          <IAMDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/roles',
    element: (
      <ProtectedRoute featureKey="roles" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <RoleManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/roles/:roleId/permissions',
    element: (
      <ProtectedRoute featureKey="role_permissions" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <RolePermissions />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/users/:userId/overrides',
    element: (
      <ProtectedRoute featureKey="user_overrides" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <UserPermissionOverrides />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/entitlements',
    element: (
      <ProtectedRoute featureKey="entitlements" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <EntitlementManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/users',
    element: (
      <ProtectedRoute featureKey="user_roles" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <UserRoleManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <NotFound /> },
]);
