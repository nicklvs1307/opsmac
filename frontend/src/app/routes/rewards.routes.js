import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const RewardsPage = lazy(() => import('@/features/Rewards/pages/RewardsPage'));
const RafflePage = lazy(() => import('@/features/Rewards/pages/RafflePage'));

const rewardsRoutes = [
  {
    path: 'fidelity/coupons/rewards',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:rewards" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <RewardsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/rewards-management',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:rewards-management" actionKey="manage">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <RewardsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/raffle',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:raffle" actionKey="participate">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <RafflePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];

export default rewardsRoutes;
