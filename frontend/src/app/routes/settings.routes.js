import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const SettingsPage = lazy(() => import('@/features/Settings/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/features/Settings/pages/ProfilePage'));
const BusinessPage = lazy(() => import('@/features/Settings/pages/BusinessPage'));
const NotificationsPage = lazy(
  () => import('@/features/Settings/pages/NotificationsPage')
);
const SecurityPage = lazy(() => import('@/features/Settings/pages/SecurityPage'));
const AppearancePage = lazy(
  () => import('@/features/Settings/pages/AppearancePage')
);
const WhatsappPage = lazy(() => import('@/features/Settings/pages/WhatsappPage'));

const settingsRoutes = [{
  path: 'settings',
  element: (
    <Suspense fallback={<div className="loading-spinner"></div>}>
      {/* Settings component now acts as a redirect */}
      <SettingsPage />
    </Suspense>
  ),
  children: [
    {
      index: true, // Default child route for /settings
      element: <ProfilePage />, // Assuming ProfilePage is the default for settings
    },
    {
      path: 'profile',
      element: (
        <ProtectedRoute featureKey="user_profile" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <ProfilePage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'business',
      element: (
        <ProtectedRoute featureKey="business_settings" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <BusinessPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'notifications',
      element: (
        <ProtectedRoute featureKey="notification_settings" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <NotificationsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'security',
      element: (
        <ProtectedRoute featureKey="security_settings" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <SecurityPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'appearance',
      element: (
        <ProtectedRoute featureKey="appearance_settings" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <AppearancePage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'whatsapp',
      element: (
        <ProtectedRoute featureKey="whatsapp_integration" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <WhatsappPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    // NPS Criteria route is intentionally omitted
  ],
};

export default settingsRoutes;
