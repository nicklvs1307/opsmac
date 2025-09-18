import React, { Suspense, lazy } from 'react';
import { createProtectedRouteElement } from '@/app/utils/routeHelpers';
import { Navigate } from 'react-router-dom';

import erpStockRoutes from './erp.stock.routes';
import erpOrdersRoutes from './erp.orders.routes';
import erpManagementRoutes from './erp.management.routes';
import erpValidityControlRoutes from './erp.validityControl.routes';
import erpFinancialRoutes from './erp.financial.routes';
import erpReportsRoutes from './erp.reports.routes';

const erpRoutes = [
  ...erpStockRoutes,
  ...erpOrdersRoutes,
  ...erpManagementRoutes,
  ...erpValidityControlRoutes,
  ...erpFinancialRoutes,
  ...erpReportsRoutes,

const Tables = lazy(() => import('@/features/ERP/Tables/pages/TablesManagementPage'));
const TechnicalSpecificationManagement = lazy(
  () => import('@/components/ERP/TechnicalSpecificationManagement')
);
