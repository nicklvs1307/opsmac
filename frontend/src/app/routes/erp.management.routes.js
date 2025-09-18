import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const ManagementDashboard = lazy(() => import('@/features/Management/pages/ManagementDashboardPage'));
const Schedule = lazy(() => import('@/features/Management/pages/SchedulePage'));
const Commissions = lazy(() => import('@/features/Management/pages/CommissionsPage'));
const Costs = lazy(() => import('@/features/Management/pages/CostsPage'));
const ManagementPermissions = lazy(() => import('@/features/Management/pages/PermissionsPage'));
const TeamManagementPage = lazy(() => import('@/features/Team/pages/TeamManagementPage'));

const erpManagementRoutes = [
  {
    path: 'management/dashboard',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ManagementDashboard />
      </Suspense>
    ),
  },
  {
    path: 'management/schedule',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Schedule />
      </Suspense>
    ),
  },
  {
    path: 'management/commissions',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Commissions />
      </Suspense>
    ),
  },
  {
    path: 'management/costs',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Costs />
      </Suspense>
    ),
  },
  {
    path: 'management/permissions',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ManagementPermissions />
      </Suspense>
    ),
  },
  {
    path: 'management/team',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <TeamManagementPage />
      </Suspense>
    ),
  },
];

export default erpManagementRoutes;
