import React, { Suspense } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import Settings from '@/features/Settings/Settings';
import ProfileSettingsPage from '@/features/Settings/pages/ProfileSettingsPage';
import BusinessSettingsPage from '@/features/Settings/pages/BusinessSettingsPage';
import NotificationsSettingsPage from '@/features/Settings/pages/NotificationsSettingsPage';
import SecuritySettingsPage from '@/features/Settings/pages/SecuritySettingsPage';
import AppearanceSettingsPage from '@/features/Settings/pages/AppearanceSettingsPage';
import WhatsappSettingsPage from '@/features/Settings/pages/WhatsappSettingsPage';

const settingsRoutes = {
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
};

export default settingsRoutes;
