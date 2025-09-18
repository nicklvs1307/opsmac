import React, { Suspense } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export const createProtectedRouteElement = (Component, featureKey, actionKey) => {
  return (
    <ProtectedRoute featureKey={featureKey} actionKey={actionKey}>
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Component />
      </Suspense>
    </ProtectedRoute>
  );
};

export const createSuspenseElement = (Component) => {
  return (
    <Suspense fallback={<div className="loading-spinner"></div>}>
      <Component />
    </Suspense>
  );
};
