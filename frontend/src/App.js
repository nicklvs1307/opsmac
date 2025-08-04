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
import FeedbackList from './pages/Satisfacao/Feedback/FeedbackList';
import NewFeedback from './pages/Satisfacao/Feedback/NewFeedback';
import FeedbackDetail from './pages/Satisfacao/Feedback/FeedbackDetail';
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
import SurveyList from './pages/Satisfacao/Avaliacoes/SurveyList';
import SurveyCreate from './pages/Satisfacao/Avaliacoes/SurveyCreate';
import SurveyResults from './pages/Satisfacao/Avaliacoes/SurveyResults';
import SurveyEdit from './pages/Satisfacao/Avaliacoes/SurveyEdit';
import AnaliseSatisfacao from './pages/Satisfacao/Analise/AnaliseSatisfacao';
import ProgramaFidelidade from './pages/Satisfacao/Fidelidade/ProgramaFidelidade';
import AdminDashboard from './pages/Admin/AdminDashboard';
import SatisfacaoDashboard from './pages/Satisfacao/SatisfacaoDashboard';
import RelationshipDashboard from './pages/Relationship/RelationshipDashboard';
import PublicCheckin from './pages/Public/PublicCheckin';
import PublicReward from './pages/Public/PublicReward'; // Adicionado
import GirarRoleta from './pages/Public/GirarRoleta'; // Adicionado

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
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/feedback/:shortUrl" element={<PublicFeedback />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/public/surveys/:slug" element={<PublicSurveyForm />} />
                <Route path="/checkin/public/:restaurantSlug" element={<PublicCheckin />} />
                <Route path="/girar-roleta" element={<GirarRoleta />} />
                <Route path="/recompensa-ganha" element={<PublicReward />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="satisfaction" element={<SatisfacaoDashboard />} />
                  <Route path="satisfaction/feedback" element={<FeedbackList />} />
                  <Route path="satisfaction/feedback/new" element={<NewFeedback />} />
                  <Route path="satisfaction/feedback/:id" element={<FeedbackDetail />} />
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
                  <Route path="satisfaction/surveys" element={<SurveyList />} />
                  <Route path="satisfaction/surveys/new" element={<SurveyCreate />} />
                  <Route path="satisfaction/surveys/edit/:id" element={<SurveyEdit />} />
                  <Route path="satisfaction/surveys/:id/results" element={<SurveyResults />} />
                  <Route path="satisfaction/analysis" element={<AnaliseSatisfacao />} />
                  <Route path="satisfaction/loyalty" element={<ProgramaFidelidade />} />
                  
                  <Route path="relationship" element={<RelationshipDashboard />} />
                </Route>
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: '#4aed88',
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