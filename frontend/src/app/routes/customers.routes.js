import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const CustomersPage = lazy(() => import('@/features/Customers/pages/CustomersPage'));
const DetailPage = lazy(() => import('@/features/Customers/pages/DetailPage'));
const BirthdaysPage = lazy(() => import('@/features/Customers/pages/BirthdaysPage'));
const DashboardPage = lazy(() => import('@/features/Customers/pages/DashboardPage'));

const customersRoutes = [
  {
    path: 'fidelity/relationship/customers',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:customers" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CustomersPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'customers/:id/details',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:customers" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <DetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/birthdays',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:birthdays" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <BirthdaysPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'customers/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <DashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];

export default customersRoutes;
