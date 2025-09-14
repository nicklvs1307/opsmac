import React, { Suspense } from 'react';
import Login from '@/features/Auth/pages/Login';
import PublicFeedback from '@/features/Public/pages/PublicFeedback';
import ThankYou from '@/features/Public/pages/ThankYou';
import PublicSurveyForm from '@/features/Public/pages/PublicSurveyForm';
import PublicCheckin from '@/features/Public/pages/PublicCheckin';
import PublicReward from '@/features/Public/pages/PublicReward';
import GirarRoleta from '@/features/Public/pages/GirarRoleta';
import PublicMenu from '@/features/Public/pages/PublicMenu';
import PublicDeliveryMenu from '@/features/Public/pages/PublicDeliveryMenu';
import PublicDineInMenu from '@/features/Public/pages/DineInMenu';
import CustomerRegistration from '@/features/Public/pages/CustomerRegistration';
import UnauthorizedPage from '@/features/Common/UnauthorizedPage';
import FeatureLockedPage from '@/features/Common/FeatureLockedPage';

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
