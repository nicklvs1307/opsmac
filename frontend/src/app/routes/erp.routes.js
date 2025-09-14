import React, { Suspense } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { Navigate } from 'react-router-dom';

import Tables from '@/features/ERP/Tables';
import TechnicalSpecificationManagement from '@/components/ERP/TechnicalSpecificationManagement';
import StockDashboardPage from '@/features/ERP/Stock/StockDashboardPage';
import StockMovementsPage from '@/features/ERP/Stock/StockMovementsPage';
import SuppliersPage from '@/features/ERP/SuppliersPage';
import PurchasesPage from '@/features/ERP/PurchasesPage';
import StockProductsPage from '@/features/ERP/Stock/StockProductsPage';
import Orders from '@/features/ERP/Orders';
import Pdv from '@/features/ERP/Pdv';
import Ingredients from '@/features/ERP/Ingredients';
import Menu from '@/features/ERP/Menu';
import LabelsDashboard from '@/features/CDV/Dashboard/pages';
import PrintLabel from '@/features/CDV/PrintLabel/pages';
import LabelsAdmin from '@/features/CDV/Admin/pages';
import StockCountList from '@/features/CDV/StockCountList';
import StockCountDetail from '@/features/CDV/StockCountDetail';
import ProductionList from '@/features/CDV/ProductionList';
import ProductionCreate from '@/features/CDV/ProductionCreate';
import DeleteLabels from '@/features/CDV/DeleteLabels/pages';
import Production from '@/features/CDV/Production/pages';
import CountProducts from '@/features/CDV/CountProducts/pages';
import CountHistory from '@/features/CDV/CountHistory/pages';

import CashFlowReport from '@/features/Reports/CashFlowReport';
import DREReport from '@/features/Reports/DREReport';
import SalesByPaymentMethodReport from '@/features/Reports/SalesByPaymentMethodReport';
import ListOfAccountsReport from '@/features/Reports/ListOfAccountsReport';
import CurrentStockPositionReport from '@/features/Reports/CurrentStockPositionReport';
import StockPositionHistoryReport from '@/features/Reports/StockPositionHistoryReport';
import PaymentMethods from '@/features/ERP/PaymentMethods';
import FinancialCategoriesPage from '@/features/ERP/FinancialCategoriesPage';
import TeamManagementPage from '@/features/Team/TeamManagementPage';
import ComingSoon from '@/features/Common/ComingSoon';

import ProductsCreate from '@/features/ERP/Stock/ProductsCreate';
import StockSettings from '@/features/ERP/Stock/Settings';
import StockReports from '@/features/ERP/Stock/Reports';
import Inventory from '@/features/ERP/Stock/Inventory';
import TechnicalSheetCreate from '@/features/ERP/Stock/TechnicalSheetCreate';
import CMV from '@/features/ERP/Stock/CMV';
import Adjustments from '@/features/ERP/Stock/Adjustments';
import Lots from '@/features/ERP/Stock/Lots';
import Alerts from '@/features/ERP/Stock/Alerts';
import Integrations from '@/features/ERP/Orders/Integrations';
import Delivery from '@/features/ERP/Orders/Delivery';
import SalesReport from '@/features/ERP/Orders/SalesReport';
import ManagementDashboard from '@/features/Management/Dashboard';
import Schedule from '@/features/Management/Schedule';
import Commissions from '@/features/Management/Commissions';
import Costs from '@/features/Management/Costs';
import ManagementPermissions from '@/features/Management/Permissions';
import DeliveryMenuPage from '@/features/Orders/DigitalMenus/DeliveryMenuPage';


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
    path: 'cdv/dashboard',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <LabelsDashboard />
      </Suspense>
    ),
  },
  {
    path: 'cdv/labels/print',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PrintLabel />
      </Suspense>
    ),
  },
  {
    path: 'cdv/labels/print-group',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'cdv/labels/count',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <CountProducts />
      </Suspense>
    ),
  },
  {
    path: 'cdv/labels/count-history',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <CountHistory />
      </Suspense>
    ),
  },
  {
    path: 'cdv/labels/history',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'cdv/labels/delete',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <DeleteLabels />
      </Suspense>
    ),
  },
  {
    path: 'cdv/production',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Production />
      </Suspense>
    ),
  },
  {
    path: 'cdv/labels',
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
    path: 'cdv/stock-counts/:id',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockCountDetail />
      </Suspense>
    ),
  },
  {
    path: 'cdv/stock-counts',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <StockCountList />
      </Suspense>
    ),
  },
  {
    path: 'cdv/productions',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ProductionList />
      </Suspense>
    ),
  },
  {
    path: 'cdv/productions/new',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ProductionCreate />
      </Suspense>
    ),
  },
  {
    path: 'cdv/expirations',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: 'cdv/expirations-alert',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ComingSoon />
      </Suspense>
    ),
  },
];

export default erpRoutes;
