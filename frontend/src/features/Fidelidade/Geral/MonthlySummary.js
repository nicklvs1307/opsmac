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
import { useDashboardOverview, useEvolutionAnalytics, useRewardsAnalytics } from '@/features/Dashboard/api/dashboardQueries';
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

const MonthlySummary = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const { data: overviewData, isLoading: isLoadingOverview, isError: isErrorOverview, error: errorOverview } = useDashboardOverview(restaurantId);

  const twelveMonthsAgo = format(subMonths(new Date(), 12), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: evolutionData, isLoading: isLoadingEvolution, isError: isErrorEvolution, error: errorEvolution } = useEvolutionAnalytics(restaurantId, { start_date: twelveMonthsAgo, end_date: today, granularity: 'month' });

  const { data: rewardsAnalyticsData, isLoading: isLoadingRewards, isError: isErrorRewards, error: errorRewards } = useRewardsAnalytics(restaurantId);

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
        {errorOverview?.message || errorEvolution?.message || errorRewards?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  const [selectedMetric, setSelectedMetric] = useState('checkins');

  const monthlyTrendData = evolutionData?.map(d => ({
      name: format(new Date(d.date), 'MMM/yy'),
      value: d[selectedMetric], // Use selectedMetric here
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.monthly_summary_title')}
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('monthly_summary.total_checkins')}
              </Typography>
              <Typography variant="h4" component="div">
                {overviewData?.totalCheckins || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('monthly_summary.new_customers')}
              </Typography>
              <Typography variant="h4" component="div">
                {overviewData?.newCustomers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('monthly_summary.total_survey_responses')}
              </Typography>
              <Typography variant="h4" component="div">
                {overviewData?.totalSurveyResponses || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('monthly_summary.redeemed_coupons')}
              </Typography>
              <Typography variant="h4" component="div">
                {overviewData?.redeemedCoupons || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('monthly_summary.avg_nps_score')}
              </Typography>
              <Typography variant="h4" component="div">
                {overviewData?.avgNpsScore?.toFixed(1) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('monthly_summary.avg_rating')}
              </Typography>
              <Typography variant="h4" component="div">
                {overviewData?.avgRating?.toFixed(1) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* New Loyalty Metrics Cards */}
        <Grid item xs={12} md={4}>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t('monthly_summary.total_loyalty_points')}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {overviewData?.totalLoyaltyPoints?.toFixed(0) || 0}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={4}>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t('monthly_summary.total_spent_overall')}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {overviewData?.totalSpentOverall?.toFixed(2) || 0}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={4}>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t('monthly_summary.engagement_rate')}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {overviewData?.engagementRate?.toFixed(2) || 0}%
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={4}>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t('monthly_summary.loyalty_rate')}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {overviewData?.loyaltyRate?.toFixed(2) || 0}%
                    </Typography>
                </CardContent>
            </Card>
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
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('monthly_summary.total_rewards')}
                </Typography>
                <Typography variant="h4" component="div">
                    {rewardsAnalyticsData?.total_rewards || 0}
                </Typography>
            </CardContent>
        </Card>
    </Grid>
    <Grid item xs={12} md={4}>
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('monthly_summary.active_rewards')}
                </Typography>
                <Typography variant="h4" component="div">
                    {rewardsAnalyticsData?.active_rewards || 0}
                </Typography>
            </CardContent>
        </Card>
    </Grid>
    <Grid item xs={12} md={4}>
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('monthly_summary.total_coupons_generated')}
                </Typography>
                <Typography variant="h4" component="div">
                    {rewardsAnalyticsData?.total_coupons_generated || 0}
                </Typography>
            </CardContent>
        </Card>
    </Grid>
    <Grid item xs={12} md={4}>
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('monthly_summary.total_coupons_redeemed')}
                </Typography>
                <Typography variant="h4" component="div">
                    {rewardsAnalyticsData?.total_coupons_redeemed || 0}
                </Typography>
            </CardContent>
        </Card>
    </Grid>
    <Grid item xs={12} md={4}>
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('monthly_summary.redemption_rate')}
                </Typography>
                <Typography variant="h4" component="div">
                    {rewardsAnalyticsData?.redemption_rate?.toFixed(2) || 0}%
                </Typography>
            </CardContent>
        </Card>
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
                        <li key={index}>{type.reward_type}: {type.count}</li>
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
        <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t('monthly_summary.select_metric')}</InputLabel>
            <Select
                value={selectedMetric}
                label={t('monthly_summary.select_metric')}
                onChange={(e) => setSelectedMetric(e.target.value)}
            >
                <MenuItem value="checkins">{t('monthly_summary.total_checkins')}</MenuItem>
                <MenuItem value="newCustomers">{t('monthly_summary.new_customers')}</MenuItem>
                <MenuItem value="surveys">{t('monthly_summary.total_survey_responses')}</MenuItem>
                <MenuItem value="coupons">{t('monthly_summary.redeemed_coupons')}</MenuItem>
                <MenuItem value="nps">{t('monthly_summary.avg_nps_score')}</MenuItem>
                <MenuItem value="csat">{t('monthly_summary.avg_rating')}</MenuItem>
                <MenuItem value="loyaltyPoints">{t('monthly_summary.total_loyalty_points')}</MenuItem>
                <MenuItem value="totalSpent">{t('monthly_summary.total_spent_overall')}</MenuItem>
                <MenuItem value="engagementRate">{t('monthly_summary.engagement_rate')}</MenuItem>
                <MenuItem value="loyaltyRate">{t('monthly_summary.loyalty_rate')}</MenuItem>
            </Select>
        </FormControl>
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