import React, { Suspense } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

import Dashboard from '@/features/Dashboard/pages/Dashboard';
import FeedbackList from '@/features/Feedback/pages/FeedbackList';
import NewFeedback from '@/features/Feedback/pages/NewFeedback';
import FeedbackDetail from '@/features/Feedback/pages/FeedbackDetail';
import QRCodeManage from '@/features/QRCode/pages/QRCodeManage';
import QRCodeGenerate from '@/features/QRCode/pages/QRCodeGenerate';
import Rewards from '@/features/Rewards/pages/Rewards';
import Customers from '@/features/Customers/pages/Customers';
import CouponListPage from '@/features/Coupons/pages/CouponListPage';
import CouponValidatorPage from '@/features/Coupons/pages/CouponValidatorPage';
import CouponCreatePage from '@/features/Coupons/pages/CouponCreatePage';
import CouponEditPage from '@/features/Coupons/pages/CouponEditPage';
import CouponDashboardPage from '@/features/Coupons/pages/CouponDashboardPage';
import CustomerDetail from '@/features/Customers/pages/CustomerDetail';
import CustomerBirthdays from '@/features/Customers/pages/CustomerBirthdays';
import CustomerDashboard from '@/features/Customers/pages/CustomerDashboard';

import CheckinAnalyticsPage from '@/features/Fidelidade/Checkin/pages/CheckinAnalyticsPage';
import CheckinSettingsPage from '@/features/Fidelidade/Checkin/pages/CheckinSettingsPage';
import ActiveCheckinsPage from '@/features/Fidelidade/Checkin/pages/ActiveCheckinsPage';
import SurveyCreate from '@/features/Fidelidade/Avaliacoes/pages/SurveyCreate';
import SurveyResults from '@/features/Fidelidade/Avaliacoes/pages/SurveyResults';
import SurveyEdit from '@/features/Fidelidade/Avaliacoes/pages/SurveyEdit';
import SurveyList from '@/features/Fidelidade/Avaliacoes/pages/SurveyList';

import SatisfactionAnalyticsPage from '@/features/Fidelidade/Avaliacoes/pages/SatisfactionAnalyticsPage';
import SatisfactionSettingsPage from '@/features/Fidelidade/Avaliacoes/pages/SatisfactionSettingsPage';
import RelationshipDashboard from '@/features/Relationship/pages/RelationshipDashboard';

import IntegrationsPage from '@/features/Integrations/pages/IntegrationsPage';

import MonthlySummary from '@/features/Fidelidade/Geral/pages/MonthlySummary';
import SatisfactionOverview from '@/features/Fidelidade/Geral/pages/SatisfactionOverview';
import SurveysComparison from '@/features/Fidelidade/Geral/pages/SurveysComparison';
import Evolution from '@/features/Fidelidade/Geral/pages/Evolution';
import Benchmarking from '@/features/Fidelidade/Geral/pages/Benchmarking';
import MultipleChoice from '@/features/Fidelidade/Geral/pages/MultipleChoice';
import WordClouds from '@/features/Fidelidade/Geral/pages/WordClouds';
import Raffle from '@/features/Fidelidade/Cupons/pages/Raffle';
import Replicas from '@/features/Fidelidade/Respostas/pages/Replicas';
import Goals from '@/features/Fidelidade/Respostas/pages/Goals';
import Import from '@/features/Fidelidade/Respostas/pages/Import';
import Ranking from '@/features/Fidelidade/Relacionamento/pages/Ranking';
import Dispatches from '@/features/Fidelidade/Relacionamento/pages/Dispatches';
import Campaigns from '@/features/Fidelidade/Relacionamento/pages/Campaigns';
import Messages from '@/features/Fidelidade/Relacionamento/pages/Messages';
import Segmentation from '@/features/Fidelidade/Relacionamento/pages/Segmentation';
import FidelityReports from '@/features/Fidelidade/pages/Reports';
import GeneratedCouponsReport from '@/features/Reports/pages/GeneratedCouponsReport';
import ComingSoon from '@/features/Common/ComingSoon';


const fidelityRoutes = [
  {
    path: 'fidelity/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:general:dashboard" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Dashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/monthly-summary',
    element: (
      <ProtectedRoute featureKey="fidelity:general:monthly-summary" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <MonthlySummary />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction-overview',
    element: (
      <ProtectedRoute featureKey="fidelity:general:satisfaction-overview" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <SatisfactionOverview />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys-comparison',
    element: (
      <ProtectedRoute featureKey="fidelity:general:surveys-comparison" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <SurveysComparison />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/evolution',
    element: (
      <ProtectedRoute featureKey="fidelity:general:evolution" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Evolution />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/benchmarking',
    element: (
      <ProtectedRoute featureKey="fidelity:general:benchmarking" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Benchmarking />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/multiple-choice',
    element: (
      <ProtectedRoute featureKey="fidelity:general:multiple-choice" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <MultipleChoice />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/word-clouds',
    element: (
      <ProtectedRoute featureKey="fidelity:general:word-clouds" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <WordClouds />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'feedback/new',
    element: (
      <ProtectedRoute featureKey="feedback_management" actionKey="create">
        <Suspense fallback={<div>Carregando...</div>}>
          <NewFeedback />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'feedback/:id',
    element: (
      <ProtectedRoute featureKey="feedback_management" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <FeedbackDetail />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'qrcodes',
    element: (
      <ProtectedRoute featureKey="qrcodes" actionKey="manage">
        <Suspense fallback={<div>Carregando...</div>}>
          <QRCodeManage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'qrcodes/new',
    element: (
      <ProtectedRoute featureKey="qrcodes" actionKey="create">
        <Suspense fallback={<div>Carregando...</div>}>
          <QRCodeGenerate />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/rewards',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:rewards" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Rewards />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/rewards-management',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:rewards-management" actionKey="manage">
        <Suspense fallback={<div>Carregando...</div>}>
          <Rewards />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/rewards-create',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:rewards-create" actionKey="create">
        <Suspense fallback={<div>Carregando...</div>}>
          <CouponCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/edit/:id',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:management" actionKey="update">
        <Suspense fallback={<div>Carregando...</div>}>
          <CouponEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:dashboard" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <CouponDashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/list',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:list" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <CouponListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/management',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:management" actionKey="manage">
        <Suspense fallback={<div>Carregando...</div>}>
          <CouponListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/validation',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:validation" actionKey="update">
        <Suspense fallback={<div>Carregando...</div>}>
          <CouponValidatorPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/raffle',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:raffle" actionKey="participate">
        <Suspense fallback={<div>Carregando...</div>}>
          <Raffle />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/customers',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:customers" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Customers />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'customers/:id/details',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:customers" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <CustomerDetail />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/birthdays',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:birthdays" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <CustomerBirthdays />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'customers/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:dashboard" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <CustomerDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/checkin/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:checkin:dashboard" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <CheckinAnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/checkin/settings',
    element: (
      <ProtectedRoute featureKey="fidelity:checkin:settings" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <CheckinSettingsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/checkin/active',
    element: (
      <ProtectedRoute featureKey="fidelity:checkin:active" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <ActiveCheckinsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:dashboard" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <SatisfactionAnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction/settings',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:settings" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <SatisfactionSettingsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction/surveys',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <SurveyList />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/management',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:management" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <FeedbackList />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:dashboard" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <FeedbackList />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/replicas',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:replicas" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Replicas />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/goals',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:goals" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Goals />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/import',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:import" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Import />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys/new',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="create">
        <Suspense fallback={<div>Carregando...</div>}>
          <SurveyCreate />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys/edit/:id',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="update">
        <Suspense fallback={<div>Carregando...</div>}>
          <SurveyEdit />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys/:id/results',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <SurveyResults />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:dashboard" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <RelationshipDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/ranking',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:ranking" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Ranking />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/dispatches',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:dispatches" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Dispatches />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/campaigns',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:campaigns" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Campaigns />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/messages',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:messages" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Messages />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/segmentation',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:segmentation" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <Segmentation />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/integrations',
    element: (
      <ProtectedRoute featureKey="fidelity:integrations" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <IntegrationsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/reports',
    element: (
      <ProtectedRoute featureKey="fidelity:reports" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <FidelityReports />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/redemption-reports',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:redemption-reports" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <GeneratedCouponsReport />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/automation/flows',
    element: (
      <ProtectedRoute featureKey="fidelity:automation:flows" actionKey="read">
        <Suspense fallback={<div>Carregando...</div>}>
          <ComingSoon />
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
];

export default fidelityRoutes;
