import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const AdminUsersPage = lazy(() => import('@/features/Admin/AdminUsersPage'));
const AdminRestaurantsPage = lazy(() => import('@/features/Admin/AdminRestaurantsPage'));
const RestaurantEditPage = lazy(() => import('@/features/Admin/RestaurantEditPage'));
const MenuManagement = lazy(() => import('@/features/Admin/MenuManagement'));
const RestaurantCreatePage = lazy(() => import('@/features/Admin/RestaurantCreatePage'));
const UserEditPage = lazy(() => import('@/features/Admin/UserEditPage'));
const UserCreatePage = lazy(() => import('@/features/Admin/UserCreatePage'));
const RolePermissionManagementPage = lazy(() => import('@/components/Admin/RolePermissionManagementPage'));

const IAMDashboard = lazy(() => import('@/features/IAM/pages/IAMDashboard'));
const RoleManagement = lazy(() => import('@/features/IAM/pages/RoleManagement'));
const RolePermissions = lazy(() => import('@/features/IAM/pages/RolePermissions'));
const UserPermissionOverrides = lazy(() => import('@/features/IAM/pages/UserPermissionOverrides'));
const EntitlementManagement = lazy(() => import('@/features/IAM/pages/EntitlementManagement'));
const UserRoleManagement = lazy(() => import('@/features/IAM/pages/UserRoleManagement'));

const Settings = lazy(() => import('@/features/Settings/pages/Settings'));
const StockDashboardPage = lazy(() => import('@/features/ERP/pages/StockDashboardPage'));
const StockProductsPage = lazy(() => import('@/features/ERP/pages/StockProductsPage'));
const CouponListPage = lazy(() => import('@/features/Coupons/pages/CouponListPage'));
const SurveyList = lazy(() => import('@/features/Fidelidade/Avaliacoes/pages/SurveyList'));
const CheckinAnalyticsPage = lazy(() => import('@/features/Fidelidade/Checkin/pages/CheckinAnalyticsPage'));
const Tables = lazy(() => import('@/features/ERP/pages/Tables'));
const QRCodeManage = lazy(() => import('@/features/QRCode/pages/QRCodeManage'));
const SuppliersPage = lazy(() => import('@/features/ERP/pages/SuppliersPage'));
const ProductionList = lazy(() => import('@/features/ValidityControl/ProductionList'));
const ComingSoon = lazy(() => import('@/features/Common/ComingSoon'));
const WaiterPage = lazy(() => import('@/features/Waiter/pages/WaiterPage'));
const OrderPage = lazy(() => import('@/features/Waiter/pages/OrderPage'));


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
