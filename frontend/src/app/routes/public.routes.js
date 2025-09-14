import React, { Suspense, lazy } from 'react';

const Login = lazy(() => import('@/features/Auth/pages/Login'));
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
const UnauthorizedPage = lazy(() => import('@/features/Common/UnauthorizedPage'));
const FeatureLockedPage = lazy(() => import('@/features/Common/FeatureLockedPage'));

const publicRoutes = [
  {
    path: '/login',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: '/feature-locked',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <FeatureLockedPage />
      </Suspense>
    ),
  },
  {
    path: '/feedback/:shortUrl',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicFeedback />
      </Suspense>
    ),
  },
  {
    path: '/thank-you',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <ThankYou />
      </Suspense>
    ),
  },
  {
    path: '/public/surveys/:restaurantSlug/:surveySlug/:customerId?',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicSurveyForm />
      </Suspense>
    ),
  },
  {
    path: '/checkin/public/:restaurantSlug',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicCheckin />
      </Suspense>
    ),
  },
  {
    path: '/girar-roleta',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <GirarRoleta />
      </Suspense>
    ),
  },
  {
    path: '/recompensa-ganha',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicReward />
      </Suspense>
    ),
  },
  {
    path: '/menu/:restaurantSlug',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicMenu />
      </Suspense>
    ),
  },
  {
    path: '/menu/delivery/:restaurantSlug',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicDeliveryMenu />
      </Suspense>
    ),
  },
  {
    path: '/menu/:restaurantSlug/:tableNumber',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicDineInMenu />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <CustomerRegistration />
      </Suspense>
    ),
  },
];

export default publicRoutes;
