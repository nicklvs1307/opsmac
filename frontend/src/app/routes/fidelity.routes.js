import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const Dashboard = lazy(() => import('@/features/Dashboard/pages/Dashboard'));
const FeedbackList = lazy(() => import('@/features/Feedback/pages/FeedbackList'));
const NewFeedback = lazy(() => import('@/features/Feedback/pages/NewFeedback'));
const FeedbackDetail = lazy(() => import('@/features/Feedback/pages/FeedbackDetail'));
const QRCodeManage = lazy(() => import('@/features/QRCode/pages/QRCodeManage'));
const QRCodeGenerate = lazy(() => import('@/features/QRCode/pages/QRCodeGenerate'));
const Rewards = lazy(() => import('@/features/Rewards/pages/Rewards'));
const Customers = lazy(() => import('@/features/Customers/pages/Customers'));
const CouponListPage = lazy(() => import('@/features/Coupons/pages/CouponListPage'));
const CouponValidatorPage = lazy(() => import('@/features/Coupons/pages/CouponValidatorPage'));
const CouponCreatePage = lazy(() => import('@/features/Coupons/pages/CouponCreatePage'));
const CouponEditPage = lazy(() => import('@/features/Coupons/pages/CouponEditPage'));
const CouponDashboardPage = lazy(() => import('@/features/Coupons/pages/CouponDashboardPage'));
const CustomerDetail = lazy(() => import('@/features/Customers/pages/CustomerDetail'));
const CustomerBirthdays = lazy(() => import('@/features/Customers/pages/CustomerBirthdays'));
const CustomerDashboard = lazy(() => import('@/features/Customers/pages/CustomerDashboard'));

const CheckinAnalyticsPage = lazy(
  () => import('@/features/Fidelidade/Checkin/pages/CheckinAnalyticsPage')
);
const CheckinSettingsPage = lazy(
  () => import('@/features/Fidelidade/Checkin/pages/CheckinSettingsPage')
);
const ActiveCheckinsPage = lazy(
  () => import('@/features/Fidelidade/Checkin/pages/ActiveCheckinsPage')
);
const SurveyCreate = lazy(() => import('@/features/Fidelidade/Avaliacoes/pages/SurveyCreate'));
const SurveyResults = lazy(() => import('@/features/Fidelidade/Avaliacoes/pages/SurveyResults'));
const SurveyEdit = lazy(() => import('@/features/Fidelidade/Avaliacoes/pages/SurveyEdit'));
const SurveyList = lazy(() => import('@/features/Fidelidade/Avaliacoes/pages/SurveyList'));

const SatisfactionAnalyticsPage = lazy(
  () => import('@/features/Fidelidade/Avaliacoes/pages/SatisfactionAnalyticsPage')
);
const SatisfactionSettingsPage = lazy(
  () => import('@/features/Fidelidade/Avaliacoes/pages/SatisfactionSettingsPage')
);
const RelationshipDashboard = lazy(
  () => import('@/features/Relationship/pages/RelationshipDashboard')
);

const IntegrationsPage = lazy(() => import('@/features/Integrations/pages/IntegrationsPage'));

const MonthlySummary = lazy(() => import('@/features/Fidelidade/Geral/pages/MonthlySummary'));
const SatisfactionOverview = lazy(
  () => import('@/features/Fidelidade/Geral/pages/SatisfactionOverview')
);
const SurveysComparison = lazy(() => import('@/features/Fidelidade/Geral/pages/SurveysComparison'));
const Evolution = lazy(() => import('@/features/Fidelidade/Geral/pages/Evolution'));
const Benchmarking = lazy(() => import('@/features/Fidelidade/Geral/pages/Benchmarking'));
const MultipleChoice = lazy(() => import('@/features/Fidelidade/Geral/pages/MultipleChoice'));
const WordClouds = lazy(() => import('@/features/Fidelidade/Geral/pages/WordClouds'));
const Raffle = lazy(() => import('@/features/Fidelidade/Cupons/pages/Raffle'));
const Replicas = lazy(() => import('@/features/Fidelidade/Respostas/pages/Replicas'));
const Goals = lazy(() => import('@/features/Fidelidade/Respostas/pages/Goals'));
const Import = lazy(() => import('@/features/Fidelidade/Respostas/pages/Import'));
const Ranking = lazy(() => import('@/features/Fidelidade/Relacionamento/pages/Ranking'));
const Dispatches = lazy(() => import('@/features/Fidelidade/Relacionamento/pages/Dispatches'));
const Campaigns = lazy(() => import('@/features/Fidelidade/Relacionamento/pages/Campaigns'));
const Messages = lazy(() => import('@/features/Fidelidade/Relacionamento/pages/Messages'));
const Segmentation = lazy(() => import('@/features/Fidelidade/Relacionamento/pages/Segmentation'));
const FidelityReports = lazy(() => import('@/features/Fidelidade/pages/Reports'));
const GeneratedCouponsReport = lazy(
  () => import('@/features/Reports/pages/GeneratedCouponsReport')
);
const ComingSoon = lazy(() => import('@/features/Common/ComingSoon'));

const fidelityRoutes = [
  {
    path: 'fidelity/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:general:dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Dashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/monthly-summary',
    element: (
      <ProtectedRoute featureKey="fidelity:general:monthly-summary" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <MonthlySummary />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction-overview',
    element: (
      <ProtectedRoute featureKey="fidelity:general:satisfaction-overview" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SatisfactionOverview />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys-comparison',
    element: (
      <ProtectedRoute featureKey="fidelity:general:surveys-comparison" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SurveysComparison />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/evolution',
    element: (
      <ProtectedRoute featureKey="fidelity:general:evolution" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Evolution />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/benchmarking',
    element: (
      <ProtectedRoute featureKey="fidelity:general:benchmarking" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Benchmarking />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/multiple-choice',
    element: (
      <ProtectedRoute featureKey="fidelity:general:multiple-choice" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <MultipleChoice />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/word-clouds',
    element: (
      <ProtectedRoute featureKey="fidelity:general:word-clouds" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <WordClouds />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'feedback/new',
    element: (
      <ProtectedRoute featureKey="feedback_management" actionKey="create">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <NewFeedback />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'feedback/:id',
    element: (
      <ProtectedRoute featureKey="feedback_management" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <FeedbackDetail />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'qrcodes',
    element: (
      <ProtectedRoute featureKey="qrcodes" actionKey="manage">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <QRCodeManage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'qrcodes/new',
    element: (
      <ProtectedRoute featureKey="qrcodes" actionKey="create">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <QRCodeGenerate />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/rewards',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:rewards" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Rewards />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/rewards-management',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:rewards-management" actionKey="manage">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Rewards />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/rewards-create',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:rewards-create" actionKey="create">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CouponCreatePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/edit/:id',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:management" actionKey="update">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CouponEditPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CouponDashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/list',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:list" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CouponListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/management',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:management" actionKey="manage">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CouponListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/validation',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:validation" actionKey="update">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CouponValidatorPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/raffle',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:raffle" actionKey="participate">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Raffle />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/customers',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:customers" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Customers />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'customers/:id/details',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:customers" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CustomerDetail />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/birthdays',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:birthdays" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CustomerBirthdays />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'customers/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CustomerDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/checkin/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:checkin:dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CheckinAnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/checkin/settings',
    element: (
      <ProtectedRoute featureKey="fidelity:checkin:settings" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CheckinSettingsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/checkin/active',
    element: (
      <ProtectedRoute featureKey="fidelity:checkin:active" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <ActiveCheckinsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SatisfactionAnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction/settings',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:settings" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SatisfactionSettingsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/satisfaction/surveys',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SurveyList />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/management',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:management" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <FeedbackList />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <FeedbackList />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/replicas',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:replicas" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Replicas />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/goals',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:goals" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Goals />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/responses/import',
    element: (
      <ProtectedRoute featureKey="fidelity:responses:import" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Import />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys/new',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="create">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SurveyCreate />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys/edit/:id',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="update">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SurveyEdit />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/surveys/:id/results',
    element: (
      <ProtectedRoute featureKey="fidelity:satisfaction:surveys" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <SurveyResults />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/dashboard',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <RelationshipDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/ranking',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:ranking" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Ranking />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/dispatches',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:dispatches" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Dispatches />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/campaigns',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:campaigns" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Campaigns />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/messages',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:messages" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Messages />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/relationship/segmentation',
    element: (
      <ProtectedRoute featureKey="fidelity:relationship:segmentation" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <Segmentation />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/integrations',
    element: (
      <ProtectedRoute featureKey="fidelity:integrations" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <IntegrationsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/reports',
    element: (
      <ProtectedRoute featureKey="fidelity:reports" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <FidelityReports />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/coupons/redemption-reports',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:redemption-reports" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <GeneratedCouponsReport />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/automation/flows',
    element: (
      <ProtectedRoute featureKey="fidelity:automation:flows" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <ComingSoon />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'fidelity/checkin/analytics',
    element: (
      <ProtectedRoute featureKey="checkin_dashboard" actionKey="read">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <CheckinAnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];

export default fidelityRoutes;
