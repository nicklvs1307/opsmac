import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { createProtectedRouteElement, createSuspenseElement } from '@/app/utils/routeHelpers';

const UsersPage = lazy(() => import('@/features/Admin/pages/UsersPage'));
const RestaurantsPage = lazy(() => import('@/features/Admin/pages/RestaurantsPage'));
const RestaurantEditPage = lazy(() => import('@/features/Admin/pages/RestaurantEditPage'));
const ProductMenuManagementPage = lazy(() => import('@/features/Admin/pages/ProductMenuManagementPage'));
const RestaurantCreatePage = lazy(() => import('@/features/Admin/pages/RestaurantCreatePage'));
const UserEditPage = lazy(() => import('@/features/Admin/pages/UserEditPage'));
const UserCreatePage = lazy(() => import('@/features/Admin/pages/UserCreatePage'));
const AdminRolePermissionManagementPage = lazy(
  () => import('@/features/Admin/components/RolePermissionManagementPage')
);

const IAMDashboard = lazy(() => import('@/features/IAM/pages/IAMDashboard'));
const RoleManagement = lazy(() => import('@/features/IAM/pages/RoleManagement'));
const RolePermissions = lazy(() => import('@/features/IAM/pages/RolePermissions'));
const UserPermissionOverrides = lazy(() => import('@/features/IAM/pages/UserPermissionOverrides'));
const EntitlementManagement = lazy(() => import('@/features/IAM/pages/EntitlementManagement'));
const UserRoleManagement = lazy(() => import('@/features/IAM/pages/UserRoleManagement'));

const Settings = lazy(() => import('@/features/Settings/pages/SettingsPage'));
const StockDashboardPage = lazy(() => import('@/features/ERP/Stock/pages/StockDashboardPage'));
const StockProductsPage = lazy(() => import('@/features/ERP/Stock/pages/StockProductsPage'));
const CouponListPage = lazy(() => import('@/features/Coupons/pages/CouponListPage'));
const SurveyList = lazy(() => import('@/features/Satisfaction/pages/SurveyListPage'));
const CheckinAnalyticsPage = lazy(() => import('@/features/Checkin/pages/CheckinAnalyticsPage'));
const Tables = lazy(() => import('@/features/ERP/Tables/pages/TablesManagementPage'));
const QRCodeManage = lazy(() => import('@/features/QRCode/pages/QRCodeManagePage'));
const SuppliersPage = lazy(() => import('@/features/ERP/Stock/pages/SuppliersManagementPage'));
const ProductionList = lazy(() => import('@/features/ValidityControl/Production/pages'));
const ComingSoon = lazy(() => import('@/features/Common/pages/ComingSoonPage'));
const WaiterPage = lazy(() => import('@/features/Waiter/pages/WaiterPage'));
const OrderPage = lazy(() => import('@/features/Waiter/pages/OrderPage'));

const adminRoutes = [
  {
    path: 'admin/dashboard',
    element: createProtectedRouteElement(<Navigate to="/admin/users" replace />, "admin_panel", "access"),
  },
  {
    path: 'admin/restaurant-settings',
    element: createProtectedRouteElement(Settings, "restaurant_management", "update"),
  },
  {
    path: 'admin/modules',
    element: createProtectedRouteElement(ProductMenuManagementPage, "modules", "manage"),
  },
  {
    path: 'admin/reports',
    element: createProtectedRouteElement(ComingSoon, "reports", "read"),
  },
  {
    path: 'admin/financial',
    element: createProtectedRouteElement(ComingSoon, "financial", "read"),
  },
  {
    path: 'admin/stock',
    element: createProtectedRouteElement(StockDashboardPage, "stock", "read"),
  },
  {
    path: 'admin/products',
    element: createProtectedRouteElement(StockProductsPage, "products", "read"),
  },
  {
    path: 'admin/coupons',
    element: createProtectedRouteElement(CouponListPage, "coupons", "read"),
  },
  {
    path: 'admin/surveys',
    element: createProtectedRouteElement(SurveyList, "surveys", "read"),
  },

  {
    path: 'erp/tables',
    element: createProtectedRouteElement(Tables, "tables", "manage"),
  },
  {
    path: 'qrcodes/manage',
    element: createProtectedRouteElement(QRCodeManage, "qrcodes", "manage"),
  },
  {
    path: 'waiter/calls',
    element: createProtectedRouteElement(ComingSoon, "waiter_calls", "read"),
  },
  {
    path: 'whatsapp/messages',
    element: createProtectedRouteElement(ComingSoon, "whatsapp_messages", "read"),
  },
  {
    path: 'admin/losses',
    element: createProtectedRouteElement(ComingSoon, "losses", "read"),
  },
  {
    path: 'admin/suppliers',
    element: createProtectedRouteElement(SuppliersPage, "suppliers", "read"),
  },
  {
    path: 'admin/roles-permissions',

  },
  {
    path: 'admin/restaurant-modules',
    element: createProtectedRouteElement(ProductMenuManagementPage, "modules", "manage"),
  },

  {
    path: 'admin/users',
    element: createProtectedRouteElement(UsersPage, "users", "read"),
  },
  {
    path: 'admin/users/:userId/edit',
    element: createProtectedRouteElement(UserEditPage, "users", "update"),
  },
  {
    path: 'admin/users/new',
    element: createProtectedRouteElement(UserCreatePage, "users", "create"),
  },
  {
    path: 'admin/restaurants',
    element: createProtectedRouteElement(RestaurantsPage, "restaurants", "read"),
  },
  {
    path: 'admin/restaurants/:restaurantId/edit',
    element: createProtectedRouteElement(RestaurantEditPage, "admin:restaurants", "update"),
  },
  {
    path: 'admin/restaurants/new',
    element: createProtectedRouteElement(RestaurantCreatePage, "restaurants", "create"),
  },
  {
    path: '/waiter',
    element: createProtectedRouteElement(WaiterPage, "waiter_app", "access"),
  },
  {
    path: '/waiter/order/:tableId',
    element: createProtectedRouteElement(OrderPage, "waiter_app", "access"),
  },
  {
    path: '/admin/iam/:restaurantId',
    element: createProtectedRouteElement(IAMDashboard, "iam_admin", "access"),
  },
  {
    path: '/admin/iam/:restaurantId/roles',
    element: createProtectedRouteElement(RoleManagement, "roles", "read"),
  },
  {
    path: '/admin/iam/:restaurantId/roles/:roleId/permissions',
    element: createProtectedRouteElement(RolePermissions, "role_permissions", "read"),
  },
  {
    path: '/admin/iam/:restaurantId/users/:userId/overrides',
    element: createProtectedRouteElement(UserPermissionOverrides, "user_overrides", "read"),
  },
  {
    path: '/admin/iam/:restaurantId/entitlements',
    element: createProtectedRouteElement(EntitlementManagement, "entitlements", "read"),
  },
  {
    path: '/admin/iam/:restaurantId/users',
    element: createProtectedRouteElement(UserRoleManagement, "user_roles", "read"),
  },
];

export default adminRoutes;
