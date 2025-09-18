import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const CashFlowReport = lazy(() => import('@/features/Reports/pages/CashFlowReportPage'));
const DREReport = lazy(() => import('@/features/Reports/pages/DREReportPage'));
const SalesByPaymentMethodReport = lazy(() => import('@/features/Reports/pages/SalesByPaymentMethodReportPage'));
const ListOfAccountsReport = lazy(() => import('@/features/Reports/pages/ListOfAccountsReportPage'));
const CurrentStockPositionReport = lazy(() => import('@/features/Reports/pages/CurrentStockPositionReportPage'));
const StockPositionHistoryReport = lazy(() => import('@/features/Reports/pages/StockPositionHistoryReportPage'));

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
    path: 'reports/sales-by-payment-method',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <SalesByPaymentMethodReport />
      </Suspense>
    ),
  },
  {
    path: 'reports/list-of-accounts',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ListOfAccountsReport />
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
  {
    path: 'reports/stock-position-history',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <StockPositionHistoryReport />
      </Suspense>
    ),
  },
];

export default erpReportsRoutes;
