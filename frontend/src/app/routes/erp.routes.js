import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { Navigate } from 'react-router-dom';

const Tables = lazy(() => import('@/features/ERP/pages/Tables'));
const TechnicalSpecificationManagement = lazy(() => import('@/components/ERP/TechnicalSpecificationManagement'));
const StockDashboardPage = lazy(() => import('@/features/ERP/pages/StockDashboardPage'));
const StockMovementsPage = lazy(() => import('@/features/ERP/pages/StockMovementsPage'));
const SuppliersPage = lazy(() => import('@/features/ERP/pages/SuppliersPage'));
const PurchasesPage = lazy(() => import('@/features/ERP/pages/PurchasesPage'));
const StockProductsPage = lazy(() => import('@/features/ERP/pages/StockProductsPage'));
const Orders = lazy(() => import('@/features/ERP/pages/Orders'));
const Pdv = lazy(() => import('@/features/ERP/pages/Pdv'));
const Ingredients = lazy(() => import('@/features/ERP/pages/Ingredients'));
const Menu = lazy(() => import('@/features/ERP/pages/Menu'));
const LabelsDashboard = lazy(() => import('@/features/ValidityControl/Dashboard/pages'));
const PrintLabel = lazy(() => import('@/features/ValidityControl/PrintLabel/pages'));
const LabelsAdmin = lazy(() => import('@/features/ValidityControl/Admin/pages'));
const StockCountList = lazy(() => import('@/features/ValidityControl/StockCountList'));
const StockCountDetail = lazy(() => import('@/features/ValidityControl/StockCountDetail'));
const ProductionList = lazy(() => import('@/features/ValidityControl/ProductionList'));
const ProductionCreate = lazy(() => import('@/features/ValidityControl/ProductionCreate'));
const DeleteLabels = lazy(() => import('@/features/ValidityControl/DeleteLabels/pages'));
const Production = lazy(() => import('@/features/ValidityControl/Production/pages'));
const CountProducts = lazy(() => import('@/features/ValidityControl/CountProducts/pages'));
const CountHistory = lazy(() => import('@/features/ValidityControl/CountHistory/pages'));

const CashFlowReport = lazy(() => import('@/features/Reports/pages/CashFlowReport'));
const DREReport = lazy(() => import('@/features/Reports/pages/DREReport'));
const SalesByPaymentMethodReport = lazy(() => import('@/features/Reports/pages/SalesByPaymentMethodReport'));
const ListOfAccountsReport = lazy(() => import('@/features/Reports/pages/ListOfAccountsReport'));
const CurrentStockPositionReport = lazy(() => import('@/features/Reports/pages/CurrentStockPositionReport'));
const StockPositionHistoryReport = lazy(() => import('@/features/Reports/pages/StockPositionHistoryReport'));
const PaymentMethods = lazy(() => import('@/features/ERP/pages/PaymentMethods'));
const FinancialCategoriesPage = lazy(() => import('@/features/ERP/pages/FinancialCategoriesPage'));
const TeamManagementPage = lazy(() => import('@/features/Team/pages/TeamManagementPage'));
const ComingSoon = lazy(() => import('@/features/Common/ComingSoon'));

const ProductsCreate = lazy(() => import('@/features/ERP/Stock/pages/ProductsCreate'));
const StockSettings = lazy(() => import('@/features/ERP/Stock/pages/Settings'));
const StockReports = lazy(() => import('@/features/ERP/Stock/pages/Reports'));
const Inventory = lazy(() => import('@/features/ERP/Stock/pages/Inventory'));
const TechnicalSheetCreate = lazy(() => import('@/features/ERP/Stock/pages/TechnicalSheetCreate'));
const CMV = lazy(() => import('@/features/ERP/Stock/pages/CMV'));
const Adjustments = lazy(() => import('@/features/ERP/Stock/pages/Adjustments'));
const Lots = lazy(() => import('@/features/ERP/Stock/pages/Lots'));
const Alerts = lazy(() => import('@/features/ERP/Stock/pages/Alerts'));
const Integrations = lazy(() => import('@/features/ERP/Orders/pages/Integrations'));
const Delivery = lazy(() => import('@/features/ERP/Orders/pages/Delivery'));
const SalesReport = lazy(() => import('@/features/ERP/Orders/pages/SalesReport'));
const ManagementDashboard = lazy(() => import('@/features/Management/pages/Dashboard'));
const Schedule = lazy(() => import('@/features/Management/pages/Schedule'));
const Commissions = lazy(() => import('@/features/Management/pages/Commissions'));
const Costs = lazy(() => import('@/features/Management/pages/Costs'));
const ManagementPermissions = lazy(() => import('@/features/Management/pages/Permissions'));
const DeliveryMenuPage = lazy(() => import('@/features/Orders/DigitalMenus/pages/DeliveryMenuPage'));


const erpRoutes = [
  {
    path: 'erp/menu',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Menu />
      </Suspense>
    ),
  },
  {
    path: 'stock/dashboard',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockDashboardPage />
      </Suspense>
    ),
  },
  {
    path: 'stock/movements',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockMovementsPage />
      </Suspense>
    ),
  },
  {
    path: 'stock/suppliers',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <SuppliersPage />
      </Suspense>
    ),
  },
  {
    path: 'stock/purchases',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PurchasesPage />
      </Suspense>
    ),
  },
  {
    path: 'stock/products',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockProductsPage />
      </Suspense>
    ),
  },
  {
    path: 'stock/technical-sheet/list',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <TechnicalSpecificationManagement />
      </Suspense>
    ),
  },
  {
    path: 'stock/products/create',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ProductsCreate />
      </Suspense>
    ),
  },
  {
    path: 'stock/settings',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockSettings />
      </Suspense>
    ),
  },
  {
    path: 'stock/reports',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockReports />
      </Suspense>
    ),
  },
  {
    path: 'stock/inventory',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Inventory />
      </Suspense>
    ),
  },
  {
    path: 'stock/technical-sheet/create',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <TechnicalSheetCreate />
      </Suspense>
    ),
  },
  {
    path: 'stock/cmv',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <CMV />
      </Suspense>
    ),
  },
  {
    path: 'stock/adjustments',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Adjustments />
      </Suspense>
    ),
  },
  {
    path: 'stock/lots',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Lots />
      </Suspense>
    ),
  },
  {
    path: 'stock/alerts',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Alerts />
      </Suspense>
    ),
  },
  {
    path: 'integrations',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Integrations />
      </Suspense>
    ),
  },
  {
    path: 'delivery',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Delivery />
      </Suspense>
    ),
  },
  {
    path: 'sales-report',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <SalesReport />
      </Suspense>
    ),
  },
  {
    path: 'digital-menus/delivery',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <DeliveryMenuPage />
      </Suspense>
    ),
  },
  {
    path: 'management/dashboard',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ManagementDashboard />
      </Suspense>
    ),
  },
  {
    path: 'management/schedule',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Schedule />
      </Suspense>
    ),
  },
  {
    path: 'management/commissions',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Commissions />
      </Suspense>
    ),
  },
  {
    path: 'management/costs',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Costs />
      </Suspense>
    ),
  },
  {
    path: 'management/permissions',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ManagementPermissions />
      </Suspense>
    ),
  },
  {
    path: 'orders',
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Orders />
          </Suspense>
        ),
      },
      {
        path: 'pdv',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Pdv />
          </Suspense>
        ),
      },
      {
        path: 'list',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Orders />
          </Suspense>
        ),
      },
      {
        path: 'integrations',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Integrations />
          </Suspense>
        ),
      },
      {
        path: 'delivery',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Delivery />
          </Suspense>
        ),
      },
      {
        path: 'sales-report',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SalesReport />
          </Suspense>
        ),
      },
      {
        path: 'digital-menus/delivery',
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <DeliveryMenuPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: 'stock/ingredients',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Ingredients />
      </Suspense>
    ),
  },
  {
    path: 'erp/payment-methods',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PaymentMethods />
      </Suspense>
    ),
  },
  {
    path: 'erp/financial-categories',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <FinancialCategoriesPage />
      </Suspense>
    ),
  },
  {
    path: 'management/team',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <TeamManagementPage />
      </Suspense>
    ),
  },
  {
    path: 'management/production',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ProductionList />
      </Suspense>
    ),
  },
  {
    path: 'reports/cash-flow',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <CashFlowReport />
      </Suspense>
    ),
  },
  {
    path: 'reports/dre',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <DREReport />
      </Suspense>
    ),
  },
  {
    path: 'reports/sales-by-payment-method',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <SalesByPaymentMethodReport />
      </Suspense>
    ),
  },
  {
    path: 'reports/list-of-accounts',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ListOfAccountsReport />
      </Suspense>
    ),
  },
  {
    path: 'reports/current-stock-position',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <CurrentStockPositionReport />
      </Suspense>
    ),
  },
  {
    path: 'reports/stock-position-history',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockPositionHistoryReport />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/dashboard',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <LabelsDashboard />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/print',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PrintLabel />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/print-group',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/count',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <CountProducts />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/count-history',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <CountHistory />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/history',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels/delete',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <DeleteLabels />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/production',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Production />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/labels',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <LabelsAdmin />
      </Suspense>
    ),
  },
  {
    path: 'financial/payables/suppliers',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/payables/deadlines',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/payables/invoices',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/payables/recurring',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/receivables',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/invoices',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/taxes',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/sefaz',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/reports',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'financial/fiscal/settings',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/stock-counts/:id',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockCountDetail />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/stock-counts',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockCountList />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/productions',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ProductionList />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/productions/new',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ProductionCreate />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/expirations',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'validity-control/expirations-alert',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
];

export default erpRoutes;
