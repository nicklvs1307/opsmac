import React, { Suspense, lazy } from 'react';
import { createProtectedRouteElement } from '@/app/utils/routeHelpers';

const CustomersPage = lazy(() => import('@/features/Customers/pages/CustomersPage'));
const DetailPage = lazy(() => import('@/features/Customers/pages/DetailPage'));
const BirthdaysPage = lazy(() => import('@/features/Customers/pages/BirthdaysPage'));
const DashboardPage = lazy(() => import('@/features/Customers/pages/DashboardPage'));

const customersRoutes = [
  {
    path: 'fidelity/relationship/customers',
    element: createProtectedRouteElement(CustomersPage, "fidelity:relationship:customers", "read"),
  },
  {
    path: 'customers/:id/details',
    element: createProtectedRouteElement(DetailPage, "fidelity:relationship:customers", "read"),
  },
  {
    path: 'fidelity/relationship/birthdays',
    element: createProtectedRouteElement(BirthdaysPage, "fidelity:relationship:birthdays", "read"),
  },
  {
    path: 'customers/dashboard',
    element: createProtectedRouteElement(DashboardPage, "fidelity:relationship:dashboard", "read"),
  },
];

export default customersRoutes;
