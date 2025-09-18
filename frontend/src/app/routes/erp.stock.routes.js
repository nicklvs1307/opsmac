import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const StockDashboardPage = lazy(() => import('@/features/ERP/Stock/pages/StockDashboardPage'));
const StockMovementsPage = lazy(() => import('@/features/ERP/Stock/pages/StockMovementsPage'));
const SuppliersPage = lazy(() => import('@/features/ERP/Stock/pages/SuppliersManagementPage'));
const PurchasesPage = lazy(() => import('@/features/ERP/Purchases/pages/PurchasesManagementPage'));
const StockProductsPage = lazy(() => import('@/features/ERP/Stock/pages/StockProductsPage'));
const Ingredients = lazy(() => import('@/features/ERP/Ingredients/pages/IngredientsManagementPage'));
const ProductsCreate = lazy(() => import('@/features/ERP/Stock/pages/ProductsCreatePage'));
const StockSettings = lazy(() => import('@/features/ERP/Stock/pages/SettingsPage'));
const StockReports = lazy(() => import('@/features/ERP/Stock/pages/ReportsPage'));
const Inventory = lazy(() => import('@/features/ERP/Stock/pages/InventoryPage'));
const TechnicalSheetCreate = lazy(() => import('@/features/ERP/Stock/pages/TechnicalSheetCreatePage'));
const CMV = lazy(() => import('@/features/ERP/Stock/pages/CMVPage'));
const Adjustments = lazy(() => import('@/features/ERP/Stock/pages/AdjustmentsPage'));
const Lots = lazy(() => import('@/features/ERP/Stock/pages/LotsPage'));
const Alerts = lazy(() => import('@/features/ERP/Stock/pages/AlertsPage'));
const TechnicalSpecificationManagement = lazy(
  () => import('@/components/ERP/TechnicalSpecificationManagement')
);

const erpStockRoutes = [
  {
    path: 'stock/dashboard',
    element: (
      <ProtectedRoute featureKey="erp_module" actionKey="access">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <StockDashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'stock/movements',
    element: (
      <ProtectedRoute featureKey="erp_module" actionKey="access">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <StockMovementsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'stock/suppliers',
    element: (
      <ProtectedRoute featureKey="erp_module" actionKey="access">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SuppliersPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'stock/purchases',
    element: (
      <ProtectedRoute featureKey="erp_module" actionKey="access">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <PurchasesPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'stock/products',
    element: (
      <ProtectedRoute featureKey="erp_module" actionKey="access">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <StockProductsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'stock/technical-sheet/list',
    element: (
      <ProtectedRoute featureKey="erp_module" actionKey="access">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <TechnicalSpecificationManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'stock/products/create',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ProductsCreate />
      </Suspense>
    ),
  },
  {
    path: 'stock/settings',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <StockSettings />
      </Suspense>
    ),
  },
  {
    path: 'stock/reports',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <StockReports />
      </Suspense>
    ),
  },
  {
    path: 'stock/inventory',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Inventory />
      </Suspense>
    ),
  },
  {
    path: 'stock/technical-sheet/create',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <TechnicalSheetCreate />
      </Suspense>
    ),
  },
  {
    path: 'stock/cmv',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <CMV />
      </Suspense>
    ),
  },
  {
    path: 'stock/adjustments',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Adjustments />
      </Suspense>
    ),
  },
  {
    path: 'stock/lots',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Lots />
      </Suspense>
    ),
  },
  {
    path: 'stock/alerts',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Alerts />
      </Suspense>
    ),
  },
  {
    path: 'stock/ingredients',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Ingredients />
      </Suspense>
    ),
  },
];

export default erpStockRoutes;
