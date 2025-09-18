import React, { Suspense, lazy } from 'react';

const LoginPage = lazy(() => import('@/features/Auth/pages/LoginPage'));
const PublicFeedback = lazy(() => import('@/features/Public/pages/PublicFeedback'));
const ThankYou = lazy(() => import('@/features/Public/pages/ThankYou'));
const PublicSurveyForm = lazy(() => import('@/features/Public/pages/PublicSurveyForm'));
const PublicCheckin = lazy(() => import('@/features/Public/pages/PublicCheckin'));
const PublicReward = lazy(() => import('@/features/Public/pages/PublicReward'));
const GirarRoleta = lazy(() => import('@/features/Public/pages/GirarRoleta'));
const PublicMenu = lazy(() => import('@/features/Public/pages/PublicMenu'));
const PublicDeliveryMenu = lazy(() => import('@/features/Public/pages/PublicDeliveryMenu'));
const PublicDineInMenu = lazy(() => import('@/features/Public/pages/DineInMenu'));
const CustomerRegistration = lazy(() => import('@/features/Public/pages/CustomerRegistration'));
const UnauthorizedPage = lazy(() => import('@/features/Common/pages/UnauthorizedPage'));
const FeatureLockedPage = lazy(() => import('@/features/Common/pages/FeatureLockedPage'));

const publicRoutes = [
  {
    path: '/login',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: '/feature-locked',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <FeatureLockedPage />
      </Suspense>
    ),
  },
  {
    path: '/feedback/:shortUrl',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <PublicFeedback />
      </Suspense>
    ),
  },
  {
    path: '/thank-you',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <ThankYou />
      </Suspense>
    ),
  },
  {
    path: '/public/surveys/:restaurantSlug/:surveySlug/:customerId?',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <PublicSurveyForm />
      </Suspense>
    ),
  },
  {
    path: '/checkin/public/:restaurantSlug',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <PublicCheckin />
      </Suspense>
    ),
  },
  {
    path: '/girar-roleta',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <GirarRoleta />
      </Suspense>
    ),
  },
  {
    path: '/recompensa-ganha',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <PublicReward />
      </Suspense>
    ),
  },
  {
    path: '/menu/:restaurantSlug',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <PublicMenu />
      </Suspense>
    ),
  },
  {
    path: '/menu/delivery/:restaurantSlug',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <PublicDeliveryMenu />
      </Suspense>
    ),
  },
  {
    path: '/menu/:restaurantSlug/:tableNumber',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <PublicDineInMenu />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <CustomerRegistration />
      </Suspense>
    ),
  },
];

export default publicRoutes;
