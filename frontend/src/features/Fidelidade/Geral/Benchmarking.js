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
import axiosInstance from '@/services/axiosInstance';

// API function to fetch benchmarking data
const fetchBenchmarkingData = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/dashboard/benchmarking`, {
    params: { restaurantId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

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
  } = useQuery(['benchmarking', restaurantId], () => fetchBenchmarkingData({ restaurantId, token }), {
    enabled: !!restaurantId && !!token,
  });

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
  const npsChartData = [
    { name: t('benchmarking.your_nps'), value: yourRestaurantData.avgNpsScore?.toFixed(0) || 0 },
    { name: t('benchmarking.last_month'), value: lastMonthData.avgNpsScore?.toFixed(0) || 0 },
    { name: t('benchmarking.last_quarter'), value: lastQuarterData.avgNpsScore?.toFixed(0) || 0 },
    { name: t('benchmarking.last_year'), value: lastYearData.avgNpsScore?.toFixed(0) || 0 },
  ];

  const csatChartData = [
    { name: t('benchmarking.your_csat'), value: yourRestaurantData.avgRating?.toFixed(2) || 0 },
    { name: t('benchmarking.last_month'), value: lastMonthData.avgRating?.toFixed(2) || 0 },
    { name: t('benchmarking.last_quarter'), value: lastQuarterData.avgRating?.toFixed(2) || 0 },
    { name: t('benchmarking.last_year'), value: lastYearData.avgRating?.toFixed(2) || 0 },
  ];

  const checkinsChartData = [
    { name: t('benchmarking.your_checkins'), value: yourRestaurantData.totalCheckins || 0 },
    { name: t('benchmarking.last_month'), value: lastMonthData.totalCheckins || 0 },
    { name: t('benchmarking.last_quarter'), value: lastQuarterData.totalCheckins || 0 },
    { name: t('benchmarking.last_year'), value: lastYearData.totalCheckins || 0 },
  ];

  const loyaltyPointsChartData = [
    { name: t('benchmarking.your_loyalty_points'), value: yourRestaurantData.totalLoyaltyPoints || 0 },
    { name: t('benchmarking.last_month'), value: lastMonthData.totalLoyaltyPoints || 0 },
    { name: t('benchmarking.last_quarter'), value: lastQuarterData.totalLoyaltyPoints || 0 },
    { name: t('benchmarking.last_year'), value: lastYearData.totalLoyaltyPoints || 0 },
  ];

  const totalSpentChartData = [
    { name: t('benchmarking.your_total_spent'), value: yourRestaurantData.totalSpentOverall || 0 },
    { name: t('benchmarking.last_month'), value: lastMonthData.totalSpentOverall || 0 },
    { name: t('benchmarking.last_quarter'), value: lastQuarterData.totalSpentOverall || 0 },
    { name: t('benchmarking.last_year'), value: lastYearData.totalSpentOverall || 0 },
  ];

  const engagementRateChartData = [
    { name: t('benchmarking.your_engagement_rate'), value: yourRestaurantData.engagementRate || 0 },
    { name: t('benchmarking.last_month'), value: lastMonthData.engagementRate || 0 },
    { name: t('benchmarking.last_quarter'), value: lastQuarterData.engagementRate || 0 },
    { name: t('benchmarking.last_year'), value: lastYearData.engagementRate || 0 },
  ];

  const loyaltyRateChartData = [
    { name: t('benchmarking.your_loyalty_rate'), value: yourRestaurantData.loyaltyRate || 0 },
    { name: t('benchmarking.last_month'), value: lastMonthData.loyaltyRate || 0 },
    { name: t('benchmarking.last_quarter'), value: lastQuarterData.loyaltyRate || 0 },
    { name: t('benchmarking.last_year'), value: lastYearData.loyaltyRate || 0 },
  ];


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.benchmarking_title')}
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('benchmarking.your_nps')}
              </Typography>
              <Typography variant="h4" component="div">
                {yourRestaurantData.avgNpsScore?.toFixed(0) || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('benchmarking.your_csat')}
              </Typography>
              <Typography variant="h4" component="div">
                {yourRestaurantData.avgRating?.toFixed(2) || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('benchmarking.your_checkins')}
              </Typography>
              <Typography variant="h4" component="div">
                {yourRestaurantData.totalCheckins || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* New Loyalty Benchmarking Cards */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('benchmarking.your_loyalty_points')}
              </Typography>
              <Typography variant="h4" component="div">
                {yourRestaurantData.totalLoyaltyPoints || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('benchmarking.your_total_spent')}
              </Typography>
              <Typography variant="h4" component="div">
                {yourRestaurantData.totalSpentOverall?.toFixed(2) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('benchmarking.your_engagement_rate')}
              </Typography>
              <Typography variant="h4" component="div">
                {yourRestaurantData.engagementRate?.toFixed(2) || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('benchmarking.your_loyalty_rate')}
              </Typography>
              <Typography variant="h4" component="div">
                {yourRestaurantData.loyaltyRate?.toFixed(2) || 0}%
              </Typography>
            </CardContent>
          </Card>
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