import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useQuery } from 'react-query';
import { fetchBenchmarkingData } from '../api/benchmarkingService';
import MetricCard from '@/shared/components/MetricCard';

const Benchmarking = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const token = user?.token;

  const {
    data: benchmarkingData,
    isLoading,
    isError,
    error,
  } = useQuery(
    ['benchmarking', restaurantId],
    () => fetchBenchmarkingData({ restaurantId, token }),
    {
      enabled: !!restaurantId && !!token,
    }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  const yourRestaurantData = benchmarkingData?.currentMonth || {};
  const lastMonthData = benchmarkingData?.lastMonth || {};
  const lastQuarterData = benchmarkingData?.lastQuarter || {};
  const lastYearData = benchmarkingData?.lastYear || {};

  // Prepare data for charts
  const prepareChartData = (metricKey, formatFn = (val) => val) => {
    return [
      { name: t('benchmarking.your_data'), value: formatFn(yourRestaurantData[metricKey]) },
      { name: t('benchmarking.last_month'), value: formatFn(lastMonthData[metricKey]) },
      { name: t('benchmarking.last_quarter'), value: formatFn(lastQuarterData[metricKey]) },
      { name: t('benchmarking.last_year'), value: formatFn(lastYearData[metricKey]) },
    ];
  };

  const npsChartData = prepareChartData('avgNpsScore', (val) => val?.toFixed(0) || 0);
  const csatChartData = prepareChartData('avgRating', (val) => val?.toFixed(2) || 0);
  const checkinsChartData = prepareChartData('totalCheckins', (val) => val || 0);
  const loyaltyPointsChartData = prepareChartData('totalLoyaltyPoints', (val) => val || 0);
  const totalSpentChartData = prepareChartData('totalSpentOverall', (val) => val?.toFixed(2) || 0);
  const engagementRateChartData = prepareChartData('engagementRate', (val) => val?.toFixed(2) || 0);
  const loyaltyRateChartData = prepareChartData('loyaltyRate', (val) => val?.toFixed(2) || 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.benchmarking_title')}
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('benchmarking.your_nps')}
            value={yourRestaurantData.avgNpsScore?.toFixed(0) || 'N/A'}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('benchmarking.your_csat')}
            value={yourRestaurantData.avgRating?.toFixed(2) || 'N/A'}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('benchmarking.your_checkins')}
            value={yourRestaurantData.totalCheckins || 0}
          />
        </Grid>
        {/* New Loyalty Benchmarking Cards */}
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('benchmarking.your_loyalty_points')}
            value={yourRestaurantData.totalLoyaltyPoints || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('benchmarking.your_total_spent')}
            value={yourRestaurantData.totalSpentOverall?.toFixed(2) || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('benchmarking.your_engagement_rate')}
            value={`${yourRestaurantData.engagementRate?.toFixed(2) || 0}%`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title={t('benchmarking.your_loyalty_rate')}
            value={`${yourRestaurantData.loyaltyRate?.toFixed(2) || 0}%`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('benchmarking.nps_comparison')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={npsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="NPS" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('benchmarking.csat_comparison')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={csatChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="CSAT" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('benchmarking.checkins_comparison')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={checkinsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ffc658" name={t('benchmarking.checkins')} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* New Loyalty Benchmarking Charts */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('benchmarking.loyalty_points_comparison')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loyaltyPointsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#FFBB28" name={t('benchmarking.loyalty_points')} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('benchmarking.total_spent_comparison')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={totalSpentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#FF8042" name={t('benchmarking.total_spent')} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('benchmarking.engagement_rate_comparison')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementRateChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#AF19FF" name={t('benchmarking.engagement_rate')} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('benchmarking.loyalty_rate_comparison')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loyaltyRateChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#FF19FF" name={t('benchmarking.loyalty_rate')} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Benchmarking;
