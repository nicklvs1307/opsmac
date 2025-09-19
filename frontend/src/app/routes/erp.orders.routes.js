import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { Navigate } from 'react-router-dom';

const Pdv = lazy(() => import('@/features/ERP/Pdv/pages/PdvManagementPage'));
const Integrations = lazy(() => import('@/features/Orders/pages/IntegrationsPage'));
const Delivery = lazy(() => import('@/features/Orders/pages/DeliveryPage'));
const SalesReport = lazy(() => import('@/features/Orders/pages/SalesReportPage'));
const erpOrdersRoutes = [
  {
    path: 'integrations',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Integrations />
      </Suspense>
    ),
  },
  {
    path: 'delivery',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Delivery />
      </Suspense>
    ),
  },
  {
    path: 'sales-report',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <SalesReport />
      </Suspense>
    ),
  },
      {
        path: 'pdv',
        element: (
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <Pdv />
          </Suspense>
        ),
      },
      {
        path: 'integrations',
        element: (
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <Integrations />
          </Suspense>
        ),
      },
      {
        path: 'delivery',
        element: (
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <Delivery />
          </Suspense>
        ),
      },
      {
        path: 'sales-report',
        element: (
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <SalesReport />
          </Suspense>
        ),
      },
      /*
      {
        path: 'digital-menus/delivery',
        element: (
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <DeliveryMenuPage />
          </Suspense>
        ),
      },
      */];

export default erpOrdersRoutes;
