import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  useDashboardOverview,
  useEvolutionAnalytics,
  useRewardsAnalytics,
} from '@/features/Dashboard/api/dashboardService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import MetricCard from '@/shared/components/MetricCard';
import MetricSelector from '../components/MetricSelector';

const MonthlySummary = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    isError: isErrorOverview,
    error: errorOverview,
  } = useDashboardOverview(restaurantId);

  const twelveMonthsAgo = format(subMonths(new Date(), 12), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  const {
    data: evolutionData,
    isLoading: isLoadingEvolution,
    isError: isErrorEvolution,
    error: errorEvolution,
  } = useEvolutionAnalytics(restaurantId, {
    start_date: twelveMonthsAgo,
    end_date: today,
    granularity: 'month',
  });

  const {
    data: rewardsAnalyticsData,
    isLoading: isLoadingRewards,
    isError: isErrorRewards,
    error: errorRewards,
  } = useRewardsAnalytics(restaurantId);

  const [selectedMetric, setSelectedMetric] = useState('checkins');

  if (isLoadingOverview || isLoadingEvolution || isLoadingRewards) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isErrorOverview || isErrorEvolution || isErrorRewards) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorOverview?.message ||
          errorEvolution?.message ||
          errorRewards?.message ||
          t('common.error_loading_data')}
      </Alert>
    );
  }

  const getMonthlyTrendData = (data, metric, t) => {
    return (
      data?.map((d) => ({
        name: format(new Date(d.date), 'MMM/yy'),
        value: d[metric], // Use selectedMetric here
      })) || []
    );
  };

  const monthlyTrendData = getMonthlyTrendData(evolutionData, selectedMetric, t);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.monthly_summary_title')}
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.total_checkins')}
            value={overviewData?.totalCheckins || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.new_customers')}
            value={overviewData?.newCustomers || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.total_survey_responses')}
            value={overviewData?.totalSurveyResponses || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.redeemed_coupons')}
            value={overviewData?.redeemedCoupons || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.avg_nps_score')}
            value={overviewData?.avgNpsScore?.toFixed(1) || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.avg_rating')}
            value={overviewData?.avgRating?.toFixed(1) || 0}
          />
        </Grid>
        {/* New Loyalty Metrics Cards */}
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.total_loyalty_points')}
            value={overviewData?.totalLoyaltyPoints?.toFixed(0) || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.total_spent_overall')}
            value={overviewData?.totalSpentOverall?.toFixed(2) || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.engagement_rate')}
            value={`${overviewData?.engagementRate?.toFixed(2) || 0}%`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.loyalty_rate')}
            value={`${overviewData?.loyaltyRate?.toFixed(2) || 0}%`}
          />
        </Grid>
      </Grid>

      {/* Rewards Analytics Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            {t('monthly_summary.rewards_analytics_title')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.total_rewards')}
            value={rewardsAnalyticsData?.total_rewards || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.active_rewards')}
            value={rewardsAnalyticsData?.active_rewards || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.total_coupons_generated')}
            value={rewardsAnalyticsData?.total_coupons_generated || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.total_coupons_redeemed')}
            value={rewardsAnalyticsData?.total_coupons_redeemed || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('monthly_summary.redemption_rate')}
            value={`${rewardsAnalyticsData?.redemption_rate?.toFixed(2) || 0}%`}
          />
        </Grid>
        {/* Rewards by Type (example, can be a chart) */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('monthly_summary.rewards_by_type')}
            </Typography>
            {rewardsAnalyticsData?.rewards_by_type?.length > 0 ? (
              <ul>
                {rewardsAnalyticsData.rewards_by_type.map((type, index) => (
                  <li key={index}>
                    {type.reward_type}: {type.count}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('monthly_summary.no_rewards_by_type_data')}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('monthly_summary.monthly_trend')}
        </Typography>
        <MetricSelector
          selectedMetric={selectedMetric}
          onMetricChange={(e) => setSelectedMetric(e.target.value)}
        />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={monthlyTrendData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default MonthlySummary;
