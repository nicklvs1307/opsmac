import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

import AdminUsersPage from '@/features/Admin/AdminUsersPage';
import AdminRestaurantsPage from '@/features/Admin/AdminRestaurantsPage';
import RestaurantEditPage from '@/features/Admin/RestaurantEditPage';
import MenuManagement from '@/features/Admin/MenuManagement';
import RestaurantCreatePage from '@/features/Admin/RestaurantCreatePage';
import UserEditPage from '@/features/Admin/UserEditPage';
import UserCreatePage from '@/features/Admin/UserCreatePage';
import RolePermissionManagementPage from '@/components/Admin/RolePermissionManagementPage';

import IAMDashboard from '@/features/IAM/pages/IAMDashboard';
import RoleManagement from '@/features/IAM/pages/RoleManagement';
import RolePermissions from '@/features/IAM/pages/RolePermissions';
import UserPermissionOverrides from '@/features/IAM/pages/UserPermissionOverrides';
import EntitlementManagement from '@/features/IAM/pages/EntitlementManagement';
import UserRoleManagement from '@/features/IAM/pages/UserRoleManagement';

import Settings from '@/features/Settings/pages/Settings'; // Used for admin/restaurant-settings
import StockDashboardPage from '@/features/ERP/pages/StockDashboardPage'; // Used for admin/stock
import StockProductsPage from '@/features/ERP/pages/StockProductsPage'; // Used for admin/products
import CouponListPage from '@/features/Coupons/pages/CouponListPage'; // Used for admin/coupons
import SurveyList from '@/features/Fidelidade/Avaliacoes/pages/SurveyList'; // Used for admin/surveys
import CheckinAnalyticsPage from '@/features/Fidelidade/Checkin/pages/CheckinAnalyticsPage'; // Used for fidelity/checkin/analytics
import Tables from '@/features/ERP/pages/Tables'; // Used for erp/tables
import QRCodeManage from '@/features/QRCode/pages/QRCodeManage'; // Used for qrcodes/manage
import SuppliersPage from '@/features/ERP/pages/SuppliersPage'; // Used for admin/suppliers
import ProductionList from '@/features/ValidityControl/ProductionList'; // Used for admin/production (commented out)
import ComingSoon from '@/features/Common/ComingSoon';
import WaiterPage from '@/features/Waiter/pages/WaiterPage';
import OrderPage from '@/features/Waiter/pages/OrderPage';


const adminRoutes = [
  {
    path: 'admin/dashboard',
    element: (
      <ProtectedRoute featureKey="admin_panel" actionKey="access">
        <Navigate to="/admin/users" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/restaurant-settings',
    element: (
      <ProtectedRoute featureKey="restaurant_management" actionKey="update">
        <Suspense fallback={<div>Carregando...</div>}>
          <Settings />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/modules',
    element: (
      <ProtectedRoute featureKey="modules" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <MenuManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/reports',
    element: (
      <ProtectedRoute featureKey="reports" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <ComingSoon />{' '}
          {/* Keep ComingSoon for now if no specific report component is ready */}
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/financial',
    element: (
      <ProtectedRoute featureKey="financial" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <ComingSoon /> {/* Placeholder for FinancialTransactionsPage */}
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/stock',
    element: (
      <ProtectedRoute featureKey="stock" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <StockDashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/products',
    element: (
      <ProtectedRoute featureKey="products" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <StockProductsPage /> {/* Assuming this is the main products page */}
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/coupons',
    element: (
      <ProtectedRoute featureKey="coupons" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <CouponListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/surveys',
    element: (
      <ProtectedRoute featureKey="surveys" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <SurveyList />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/checkin/analytics',
    element: (
      <ProtectedRoute featureKey="checkin_dashboard" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <CheckinAnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'erp/tables',
    element: (
      <ProtectedRoute featureKey="tables" actionKey="manage">
        <Suspense fallback={<div>Carregando...</div>}>
          <Tables />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'qrcodes/manage',
    element: (
      <ProtectedRoute featureKey="qrcodes" actionKey="manage">
        <Suspense fallback={<div>Carregando...</div>}>
          <QRCodeManage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'waiter/calls',
    element: (
      <ProtectedRoute featureKey="waiter_calls" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <ComingSoon />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'whatsapp/messages',
    element: (
      <ProtectedRoute featureKey="whatsapp_messages" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <ComingSoon />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/losses',
    element: (
      <ProtectedRoute featureKey="losses" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <ComingSoon />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // {
  //   path: 'admin/production',
  //   element: (
  //     <Suspense fallback={<div>Carregando...</div>}>
  //       <ProductionList />
  //     </Suspense>
  //   ),
  // },
  {
    path: 'admin/suppliers',
    element: (
      <ProtectedRoute featureKey="suppliers" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <SuppliersPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/roles-permissions',
    element: (
      <ProtectedRoute featureKey="role_management" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <RolePermissionManagementPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/restaurant-modules',
    element: (
      <ProtectedRoute featureKey="modules" actionKey="manage">
        <Suspense fallback={<div>Carregando...</div>}>
          <MenuManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/dashboard',
    element: (
      <ProtectedRoute featureKey="admin_panel" actionKey="access">
        <Navigate to="/admin/users" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/users',
    element: (
      <ProtectedRoute featureKey="users" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <AdminUsersPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/users/:userId/edit',
    element: (
      <ProtectedRoute featureKey="users" actionKey="update">
        <Suspense fallback={<div>Carregando...</div>}>
          <UserEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/users/new',
    element: (
      <ProtectedRoute featureKey="users" actionKey="create">
        <Suspense fallback={<div>Carregando...</div>}>
          <UserCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/restaurants',
    element: (
      <ProtectedRoute featureKey="restaurants" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <AdminRestaurantsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/restaurants/:restaurantId/edit',
    element: (
      <ProtectedRoute featureKey="admin:restaurants" actionKey="update">
        <Suspense fallback={<div>Carregando...</div>}>
          <RestaurantEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/restaurants/new',
    element: (
      <ProtectedRoute featureKey="restaurants" actionKey="create">
        <Suspense fallback={<div>Carregando...</div>}>
          <RestaurantCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/waiter',
    element: (
      <ProtectedRoute featureKey="waiter_app" actionKey="access">
        <Suspense fallback={<div>Carregando...</div>}>
          <WaiterPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/waiter/order/:tableId',
    element: (
      <ProtectedRoute featureKey="waiter_app" actionKey="access">
        <Suspense fallback={<div>Carregando...</div>}>
          <OrderPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId',
    element: (
      <ProtectedRoute featureKey="iam_admin" actionKey="access">
        <Suspense fallback={<div>Carregando...</div>}>
          <IAMDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/roles',
    element: (
      <ProtectedRoute featureKey="roles" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <RoleManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/roles/:roleId/permissions',
    element: (
      <ProtectedRoute featureKey="role_permissions" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <RolePermissions />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/users/:userId/overrides',
    element: (
      <ProtectedRoute featureKey="user_overrides" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <UserPermissionOverrides />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/entitlements',
    element: (
      <ProtectedRoute featureKey="entitlements" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <EntitlementManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/iam/:restaurantId/users',
    element: (
      <ProtectedRoute featureKey="user_roles" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <UserRoleManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];

export default adminRoutes;
