import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useDashboardOverview, useEvolutionAnalytics } from '@/features/Dashboard/api/dashboardQueries';
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

  if (isLoadingOverview || isLoadingEvolution) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isErrorOverview || isErrorEvolution) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorOverview?.message || errorEvolution?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  const monthlyTrendData = evolutionData?.map(d => ({
      name: format(new Date(d.date), 'MMM/yy'),
      value: d.checkins, // or any other metric you want to show
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
      </Grid>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('monthly_summary.monthly_trend')}
        </Typography>
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