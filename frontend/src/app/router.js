import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Components
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

// Import modularized routes
import publicRoutes from '@/app/routes/public.routes';
import fidelityRoutes from '@/app/routes/fidelity.routes';
import erpRoutes from '@/app/routes/erp.routes';
import adminRoutes from '@/app/routes/admin.routes';
import settingsRoutes from '@/app/routes/settings.routes';

const NotFound = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

export const router = createBrowserRouter([
  ...publicRoutes,
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
          <Suspense fallback={<div className="loading-spinner"></div>}>
            {/* Dashboard is the default for authenticated users */}
            <Navigate to="/fidelity/dashboard" replace />
          </Suspense>
        ),
      },
      ...fidelityRoutes,
      ...erpRoutes,
      settingsRoutes, // settingsRoutes is an object, not an array
      ...adminRoutes,
    ],
  },
  { path: '*', element: <NotFound /> },
]);
