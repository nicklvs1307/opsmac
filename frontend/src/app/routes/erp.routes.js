import React, { Suspense } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { Navigate } from 'react-router-dom';

import Tables from '@/features/ERP/pages/Tables';
import TechnicalSpecificationManagement from '@/components/ERP/TechnicalSpecificationManagement';
import StockDashboardPage from '@/features/ERP/pages/StockDashboardPage';
import StockMovementsPage from '@/features/ERP/pages/StockMovementsPage';
import SuppliersPage from '@/features/ERP/pages/SuppliersPage';
import PurchasesPage from '@/features/ERP/pages/PurchasesPage';
import StockProductsPage from '@/features/ERP/pages/StockProductsPage';
import Orders from '@/features/ERP/pages/Orders';
import Pdv from '@/features/ERP/pages/Pdv';
import Ingredients from '@/features/ERP/pages/Ingredients';
import Menu from '@/features/ERP/pages/Menu';
import LabelsDashboard from '@/features/ValidityControl/Dashboard/pages';
import PrintLabel from '@/features/ValidityControl/PrintLabel/pages';
import LabelsAdmin from '@/features/ValidityControl/Admin/pages';
import StockCountList from '@/features/ValidityControl/StockCountList';
import StockCountDetail from '@/features/ValidityControl/StockCountDetail';
import ProductionList from '@/features/ValidityControl/ProductionList';
import ProductionCreate from '@/features/ValidityControl/ProductionCreate';
import DeleteLabels from '@/features/ValidityControl/DeleteLabels/pages';
import Production from '@/features/ValidityControl/Production/pages';
import CountProducts from '@/features/ValidityControl/CountProducts/pages';
import CountHistory from '@/features/ValidityControl/CountHistory/pages';

import CashFlowReport from '@/features/Reports/pages/CashFlowReport';
import DREReport from '@/features/Reports/pages/DREReport';
import SalesByPaymentMethodReport from '@/features/Reports/pages/SalesByPaymentMethodReport';
import ListOfAccountsReport from '@/features/Reports/pages/ListOfAccountsReport';
import CurrentStockPositionReport from '@/features/Reports/pages/CurrentStockPositionReport';
import StockPositionHistoryReport from '@/features/Reports/pages/StockPositionHistoryReport';
import PaymentMethods from '@/features/ERP/pages/PaymentMethods';
import FinancialCategoriesPage from '@/features/ERP/pages/FinancialCategoriesPage';
import TeamManagementPage from '@/features/Team/pages/TeamManagementPage';
import ComingSoon from '@/features/Common/ComingSoon';

import ProductsCreate from '@/features/ERP/Stock/pages/ProductsCreate';
import StockSettings from '@/features/ERP/Stock/pages/Settings';
import StockReports from '@/features/ERP/Stock/pages/Reports';
import Inventory from '@/features/ERP/Stock/pages/Inventory';
import TechnicalSheetCreate from '@/features/ERP/Stock/pages/TechnicalSheetCreate';
import CMV from '@/features/ERP/Stock/pages/CMV';
import Adjustments from '@/features/ERP/Stock/pages/Adjustments';
import Lots from '@/features/ERP/Stock/pages/Lots';
import Alerts from '@/features/ERP/Stock/pages/Alerts';
import Integrations from '@/features/ERP/Orders/pages/Integrations';
import Delivery from '@/features/ERP/Orders/pages/Delivery';
import SalesReport from '@/features/ERP/Orders/pages/SalesReport';
import ManagementDashboard from '@/features/Management/pages/Dashboard';
import Schedule from '@/features/Management/pages/Schedule';
import Commissions from '@/features/Management/pages/Commissions';
import Costs from '@/features/Management/pages/Costs';
import ManagementPermissions from '@/features/Management/pages/Permissions';
import DeliveryMenuPage from '@/features/Orders/DigitalMenus/pages/DeliveryMenuPage';


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
