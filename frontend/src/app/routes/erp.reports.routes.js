import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const CashFlowReport = lazy(() => import('@/features/Reports/pages/CashFlowReportPage'));
const DREReport = lazy(() => import('@/features/Reports/pages/DREReportPage'));
const CurrentStockPositionReport = lazy(() => import('@/features/Reports/pages/CurrentStockPositionReportPage'));

const erpReportsRoutes = [
  {
    path: 'reports/cash-flow',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <CashFlowReport />
      </Suspense>
    ),
  },
  {
    path: 'reports/dre',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <DREReport />
      </Suspense>
    ),
  },
  {
    path: 'reports/current-stock-position',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <CurrentStockPositionReport />
      </Suspense>
    ),
  },
];

export default erpReportsRoutes;
