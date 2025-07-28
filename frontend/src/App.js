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
import CustomerBirthdays from './pages/Customers/CustomerBirthdays';
import CustomerDashboard from './pages/Customers/CustomerDashboard';
import Settings from './pages/Settings/Settings';
import PublicFeedback from './pages/Public/PublicFeedback';
import ThankYou from './pages/Public/ThankYou';
import PublicSurveyForm from './pages/Public/PublicSurveyForm';
import CheckinDashboard from './pages/Checkin/CheckinDashboard';
import SurveyList from './pages/Surveys/SurveyList';
import SurveyCreate from './pages/Surveys/SurveyCreate';
import SurveyResults from './pages/Surveys/SurveyResults';
import SurveyEdit from './pages/Surveys/SurveyEdit';
import AdminDashboard from './pages/Admin/AdminDashboard';

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
                <Route path="/public/surveys/:id" element={<PublicSurveyForm />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="feedback" element={<FeedbackList />} />
                  <Route path="feedback/new" element={<NewFeedback />} />
                  <Route path="feedback/:id" element={<FeedbackDetail />} />
                  <Route path="qrcodes" element={<QRCodeManage />} />
                  <Route path="qrcodes/new" element={<QRCodeGenerate />} />
                  <Route path="rewards" element={<Rewards />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="coupons/new" element={<CouponCreateForm />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="customers/birthdays" element={<CustomerBirthdays />} />
                  <Route path="customers/dashboard" element={<CustomerDashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="checkin" element={<CheckinDashboard />} />
                  <Route path="surveys" element={<SurveyList />} />
                  <Route path="surveys/new" element={<SurveyCreate />} />
                  <Route path="surveys/edit/:id" element={<SurveyEdit />} />
                  <Route path="surveys/:id/results" element={<SurveyResults />} />
                  <Route path="surveys/:id/results" element={<SurveyResults />} />
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