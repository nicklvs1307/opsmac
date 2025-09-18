import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const LabelsDashboard = lazy(() => import('@/features/ValidityControl/Dashboard/pages'));
const PrintLabel = lazy(() => import('@/features/ValidityControl/PrintLabel/pages'));
const LabelsAdmin = lazy(() => import('@/features/ValidityControl/Admin/pages'));
const StockCountList = lazy(() => import('@/features/ValidityControl/CountProducts/pages'));
const StockCountDetail = lazy(() => import('@/features/ValidityControl/CountHistory/pages'));
const ProductionList = lazy(() => import('@/features/ValidityControl/Production/pages'));
const ProductionCreate = lazy(() => import('@/features/ValidityControl/ProductionCreate'));
const DeleteLabels = lazy(() => import('@/features/ValidityControl/DeleteLabels/pages'));
const ComingSoon = lazy(() => import('@/features/Common/pages/ComingSoonPage'));

const erpValidityControlRoutes = [
  {
    path: 'validity-control/dashboard',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <LabelsDashboard />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/print',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <PrintLabel />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/print-group',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/history',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/delete',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <DeleteLabels />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <LabelsAdmin />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/stock-counts/:id',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <StockCountDetail />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/stock-counts',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <StockCountList />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/productions',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ProductionList />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/productions/new',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ProductionCreate />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/expirations',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/expirations-alert',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
];

export default erpValidityControlRoutes;
