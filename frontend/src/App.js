import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Importar o novo ThemeProvider

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import FeedbackList from './pages/Feedback/FeedbackList';
import NewFeedback from './pages/Feedback/NewFeedback';
import FeedbackDetail from './pages/Feedback/FeedbackDetail';
import QRCodeManage from './pages/QRCode/QRCodeManage';
import QRCodeGenerate from './pages/QRCode/QRCodeGenerate';
import Rewards from './pages/Rewards/Rewards';
import Coupons from './pages/Coupons/Coupons';
import CouponCreateForm from './pages/Coupons/CouponCreateForm';
import Customers from './pages/Customers/Customers';
import CustomerDetail from './pages/Customers/CustomerDetail';
import CustomerBirthdays from './pages/Customers/CustomerBirthdays';
import CustomerDashboard from './pages/Customers/CustomerDashboard';
import Settings from './pages/Settings/Settings';
import PublicFeedback from './pages/Public/PublicFeedback';
import ThankYou from './pages/Public/ThankYou';
import PublicSurveyForm from './pages/Public/PublicSurveyForm';
import CheckinDashboard from './pages/Fidelidade/Checkin/CheckinDashboard';
import SurveyList from './pages/Fidelidade/Avaliacoes/SurveyList';
import SurveyCreate from './pages/Fidelidade/Avaliacoes/SurveyCreate';
import SurveyResults from './pages/Fidelidade/Avaliacoes/SurveyResults';
import SurveyEdit from './pages/Fidelidade/Avaliacoes/SurveyEdit';
import SatisfactionDashboard from './pages/Fidelidade/Avaliacoes/SatisfactionDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import RelationshipDashboard from './pages/Relationship/RelationshipDashboard';
import IntegrationsPage from './pages/Integrations/IntegrationsPage';
import PublicCheckin from './pages/Public/PublicCheckin';
import PublicReward from './pages/Public/PublicReward'; // Adicionado
import GirarRoleta from './pages/Public/GirarRoleta'; // Adicionado
import PublicMenu from './pages/Public/PublicMenu'; // New import for Public Menu
import PublicDeliveryMenu from './pages/Public/PublicDeliveryMenu';
import PublicDineInMenu from './pages/Public/PublicDineInMenu';
import CustomerRegistration from './pages/Public/CustomerRegistration';
import TechnicalSpecifications from './pages/ERP/Products';
import Stock from './pages/ERP/Stock';
import Tables from './pages/ERP/Tables';
import Orders from './pages/ERP/Orders';
import Pdv from './pages/ERP/Pdv';
import Ingredients from './pages/ERP/Ingredients';
import Menu from './pages/ERP/Menu';
import LabelsDashboard from './pages/Labels/LabelsDashboard';
import PrintLabel from './pages/Labels/PrintLabel';
import LabelsAdmin from './pages/Labels/LabelsAdmin';
import StockCountList from './pages/Labels/StockCountList';
import StockCountDetail from './pages/Labels/StockCountDetail';
import ProductionList from './pages/Labels/ProductionList';
import ProductionCreate from './pages/Labels/ProductionCreate';
import FinancialTransactionsPage from './pages/ERP/FinancialTransactionsPage'; // New Import
import CashFlowReport from './pages/Reports/CashFlowReport';
import DREReport from './pages/Reports/DREReport';
import SalesByPaymentMethodReport from './pages/Reports/SalesByPaymentMethodReport';
import ListOfAccountsReport from './pages/Reports/ListOfAccountsReport';
import CurrentStockPositionReport from './pages/Reports/CurrentStockPositionReport';
import StockPositionHistoryReport from './pages/Reports/StockPositionHistoryReport';
import GeneratedCouponsReport from './pages/Reports/GeneratedCouponsReport';
import PaymentMethods from './pages/ERP/PaymentMethods';
import FinancialCategoriesPage from './pages/ERP/FinancialCategoriesPage'; // New Import
import TeamManagementPage from './pages/Team/TeamManagementPage';
import WaiterPage from './pages/Waiter/WaiterPage';
import OrderPage from './pages/Waiter/OrderPage';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider> {/* Usar o ThemeProvider do contexto */}
        <AuthProvider>
          <Router>
            <div className="App bg-blue-500 text-white p-4">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/feedback/:shortUrl" element={<PublicFeedback />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/public/surveys/:restaurantSlug/:surveySlug/:customerId?" element={<PublicSurveyForm />} />
                <Route path="/checkin/public/:restaurantSlug" element={<PublicCheckin />} />
                <Route path="/girar-roleta" element={<GirarRoleta />} />
                <Route path="/recompensa-ganha" element={<PublicReward />} />
                <Route path="/menu/:restaurantSlug" element={<PublicMenu />} /> {/* New Public Menu Route */}
                <Route path="/menu/delivery/:restaurantSlug" element={<PublicDeliveryMenu />} />
                <Route path="/menu/:restaurantSlug/:tableNumber" element={<PublicDineInMenu />} />
                <Route path="/register" element={<CustomerRegistration />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="feedback/new" element={<NewFeedback />} />
                  <Route path="feedback/:id" element={<FeedbackDetail />} />
                  <Route path="qrcodes" element={<QRCodeManage />} />
                  <Route path="qrcodes/new" element={<QRCodeGenerate />} />
                  <Route path="rewards" element={<Rewards />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="coupons/new" element={<CouponCreateForm />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="customers/:id/details" element={<CustomerDetail />} />
                  <Route path="customers/birthdays" element={<CustomerBirthdays />} />
                  <Route path="customers/dashboard" element={<CustomerDashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="fidelity/checkin" element={<CheckinDashboard />} />
                  <Route path="fidelity/satisfaction" element={<SatisfactionDashboard />} />
                  <Route path="fidelity/surveys" element={<SurveyList />} />
                  <Route path="fidelity/surveys/new" element={<SurveyCreate />} />
                  <Route path="fidelity/surveys/edit/:id" element={<SurveyEdit />} />
                  <Route path="fidelity/surveys/:id/results" element={<SurveyResults />} />
                  
                  <Route path="relationship" element={<RelationshipDashboard />} />
                  <Route path="integrations" element={<IntegrationsPage />} />
                  <Route path="erp/menu" element={<Menu />} />
                  <Route path="erp/technical-specifications" element={<TechnicalSpecifications />} />
                  <Route path="erp/stock" element={<Stock />} />
                  <Route path="erp/tables" element={<Tables />} />
                  <Route path="erp/orders" element={<Orders />} />
                  <Route path="erp/pdv" element={<Pdv />} />
                  <Route path="erp/ingredients" element={<Ingredients />} />
                  <Route path="erp/payment-methods" element={<PaymentMethods />} />
                  <Route path="erp/financial-transactions" element={<FinancialTransactionsPage />} /> {/* Replaced with new component */}
                  <Route path="erp/financial-categories" element={<FinancialCategoriesPage />} /> {/* New Route */}
                  <Route path="team" element={<TeamManagementPage />} />
                  <Route path="reports/cash-flow" element={<CashFlowReport />} />
                  <Route path="reports/dre" element={<DREReport />} />
                  <Route path="reports/sales-by-payment-method" element={<SalesByPaymentMethodReport />} />
                  <Route path="reports/list-of-accounts" element={<ListOfAccountsReport />} />
                  <Route path="reports/current-stock-position" element={<CurrentStockPositionReport />} />
                  <Route path="reports/stock-position-history" element={<StockPositionHistoryReport />} />
                  <Route path="reports/generated-coupons" element={<GeneratedCouponsReport />} />
                  <Route path="labels/dashboard" element={<LabelsDashboard />} />
                  <Route path="labels/print" element={<PrintLabel />} />
                  <Route path="labels/admin" element={<LabelsAdmin />} />
                  <Route path="labels/stock-counts" element={<StockCountList />} />
                  <Route path="labels/stock-counts/:id" element={<StockCountDetail />} />
                  <Route path="labels/productions" element={<ProductionList />} />
                  <Route path="labels/productions/new" element={<ProductionCreate />} />
                </Route>
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />

                {/* Waiter Routes */}
                <Route path="/waiter" element={<ProtectedRoute allowedRoles={['waiter']}><WaiterPage /></ProtectedRoute>} />
                <Route path="/waiter/order/:tableId" element={<ProtectedRoute allowedRoles={['waiter']}><OrderPage /></ProtectedRoute>} />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              
              <Toaster
                position="top-center"
                gutter={12}
                containerStyle={{ margin: '8px' }}
                toastOptions={{
                  // Define default options
                  className: '',
                  duration: 5000,
                  style: {
                    background: '#ffffff',
                    color: '#363636',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '16px',
                    fontSize: '16px',
                  },

                  // Define options for specific types
                  success: {
                    icon: '✅',
                    duration: 3000,
                    style: {
                      borderLeft: '5px solid #27ae60',
                    },
                  },
                  error: {
                    icon: '❌',
                    duration: 5000,
                    style: {
                      borderLeft: '5px solid #e74c3c',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;