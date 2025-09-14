import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const Settings = lazy(() => import('@/features/Settings/pages/Settings'));
const ProfileSettingsPage = lazy(() => import('@/features/Settings/pages/ProfileSettingsPage'));
const BusinessSettingsPage = lazy(() => import('@/features/Settings/pages/BusinessSettingsPage'));
const NotificationsSettingsPage = lazy(() => import('@/features/Settings/pages/NotificationsSettingsPage'));
const SecuritySettingsPage = lazy(() => import('@/features/Settings/pages/SecuritySettingsPage'));
const AppearanceSettingsPage = lazy(() => import('@/features/Settings/pages/AppearanceSettingsPage'));
const WhatsappSettingsPage = lazy(() => import('@/features/Settings/pages/WhatsappSettingsPage'));

const settingsRoutes = {
  path: 'settings',
  element: (
    <Suspense fallback={<div className="loading-spinner"></div>}>
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
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <ProfileSettingsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'business',
      element: (
        <ProtectedRoute featureKey="business_settings" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <BusinessSettingsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'notifications',
      element: (
        <ProtectedRoute featureKey="notification_settings" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <NotificationsSettingsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'security',
      element: (
        <ProtectedRoute featureKey="security_settings" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <SecuritySettingsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'appearance',
      element: (
        <ProtectedRoute featureKey="appearance_settings" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <AppearanceSettingsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'whatsapp',
      element: (
        <ProtectedRoute featureKey="whatsapp_integration" actionKey="update">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <WhatsappSettingsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    // NPS Criteria route is intentionally omitted
  ],
};

export default settingsRoutes;
