import React, { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const Dashboard = lazy(() => import('@/features/Relationship/pages/SegmentationDashboardPage'));
const QRCodeManage = lazy(() => import('@/features/QRCode/pages/QRCodeManagePage'));
const QRCodeGenerate = lazy(() => import('@/features/QRCode/pages/QRCodeGeneratePage'));


const CouponListPage = lazy(() => import('@/features/Coupons/pages/CouponListPage'));
const CouponValidatorPage = lazy(() => import('@/features/Coupons/pages/CouponValidatorPage'));
const CouponCreatePage = lazy(() => import('@/features/Coupons/pages/CouponCreatePage'));
const CouponEditPage = lazy(() => import('@/features/Coupons/pages/CouponEditPage'));
const CouponDashboardPage = lazy(() => import('@/features/Coupons/pages/CouponDashboardPage'));




const CheckinAnalyticsPage = lazy(() => import('@/features/Checkin/pages/CheckinAnalyticsPage'));
const CheckinSettingsPage = lazy(() => import('@/features/Checkin/pages/CheckinSettingsPage'));
const ActiveCheckinsPage = lazy(() => import('@/features/Checkin/pages/ActiveCheckinsPage'));







const RelationshipDashboard = lazy(() => import('@/features/Relationship/pages/SegmentationDashboardPage'));

const IntegrationsPage = lazy(() => import('@/features/Integrations/pages/IntegrationsDashboardPage'));



const Replicas = lazy(() => import('@/features/Goals/pages/ReplicasPage'));
const Goals = lazy(() => import('@/features/Goals/pages/GoalsManagementPage'));
const Import = lazy(() => import('@/features/Goals/pages/ImportPage'));
const Ranking = lazy(() => import('@/features/Relationship/pages/RankingPage'));
const Dispatches = lazy(() => import('@/features/Relationship/pages/DispatchesPage'));
const Campaigns = lazy(() => import('@/features/Relationship/pages/CampaignsPage'));
const Messages = lazy(() => import('@/features/Relationship/pages/MessagesPage'));
const Segmentation = lazy(() => import('@/features/Relationship/pages/SegmentationManagementPage'));

const GeneratedCouponsReport = lazy(() => import('@/features/Coupons/pages/GeneratedCouponsReport'));
const ComingSoon = lazy(() => import('@/features/Common/pages/ComingSoonPage'));

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
    path: 'fidelity/coupons/create',
    element: (
      <ProtectedRoute featureKey="fidelity:coupons:create" actionKey="create">
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
