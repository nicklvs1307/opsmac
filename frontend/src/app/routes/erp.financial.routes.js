import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const PaymentMethods = lazy(() => import('@/features/ERP/PaymentMethods/pages/PaymentMethodsManagementPage'));
const FinancialCategoriesPage = lazy(() => import('@/features/ERP/pages/FinancialCategoriesPage'));
const ComingSoon = lazy(() => import('@/features/Common/pages/ComingSoonPage'));

const erpFinancialRoutes = [
  {
    path: 'erp/payment-methods',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <PaymentMethods />
      </Suspense>
    ),
  },
  {
    path: 'erp/financial-categories',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <FinancialCategoriesPage />
      </Suspense>
    ),
  },
  {
    path: 'financial/payables/suppliers',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/payables/deadlines',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/payables/invoices',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/payables/recurring',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/receivables',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/invoices',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/taxes',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/sefaz',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/reports',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/settings',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
];

export default erpFinancialRoutes;
