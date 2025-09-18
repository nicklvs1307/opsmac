import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const AnalyticsPage = lazy(() => import('@/features/Satisfaction/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/features/Satisfaction/pages/SettingsPage'));
const SurveyCreatePage = lazy(() => import('@/features/Satisfaction/pages/SurveyCreatePage'));
const SurveyEditPage = lazy(() => import('@/features/Satisfaction/pages/SurveyEditPage'));
const SurveyListPage = lazy(() => import('@/features/Satisfaction/pages/SurveyListPage'));
const SurveyResultsPage = lazy(() => import('@/features/Satisfaction/pages/SurveyResultsPage'));

const satisfactionRoutes = [
  {
    path: 'fidelity/satisfaction/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <AnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction/settings',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:settings" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SettingsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction/surveys',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SurveyListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys/new',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="create">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SurveyCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys/edit/:id',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="update">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SurveyEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys/:id/results',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SurveyResultsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];

export default satisfactionRoutes;
