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
  TextField,
  Button,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSatisfactionAnalytics } from '../Avaliacoes/api/satisfactionService';
import { useEvolutionAnalytics, useRatingDistribution } from '@/features/Dashboard/api/dashboardQueries';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { format, subMonths } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const SatisfactionOverview = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  

  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: analyticsData, isLoading: isLoadingAnalytics, isError: isErrorAnalytics, error: errorAnalytics } = useSatisfactionAnalytics(restaurantId, { start_date: startDate, end_date: endDate });
  const { data: evolutionData, isLoading: isLoadingEvolution, isError: isErrorEvolution, error: errorEvolution } = useEvolutionAnalytics(restaurantId, { start_date: startDate, end_date: endDate, granularity: 'month' });
  const { data: ratingDistributionData, isLoading: isLoadingRating, isError: isErrorRating, error: errorRating } = useRatingDistribution(restaurantId, { start_date: startDate, end_date: endDate });

  if (isLoadingAnalytics || isLoadingEvolution || isLoadingRating) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isErrorAnalytics || isErrorEvolution || isErrorRating) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorAnalytics?.message || errorEvolution?.message || errorRating?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  const { totalResponses, averageNps, averageCsat, npsMetricsPerCriterion } = analyticsData;

  const monthlySatisfactionTrend = evolutionData?.map(d => ({
      name: format(new Date(d.date), 'MMM/yy'),
      nps: d.nps,
      csat: d.csat,
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.satisfaction_overview_title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                  <TextField
                      label={t('common.start_date')}
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                  />
              </Grid>
              <Grid item xs={12} md={5}>
                  <TextField
                      label={t('common.end_date')}
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                  />
              </Grid>
              <Grid item xs={12} md={2}>
                  <Button variant="contained" fullWidth>
                      {t('common.apply_filters')}
                  </Button>
              </Grid>
          </Grid>
      </Paper>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('satisfaction_overview.total_responses')}
              </Typography>
              <Typography variant="h4" component="div">
                {totalResponses || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('satisfaction_overview.average_nps')}
              </Typography>
              <Typography variant="h4" component="div">
                {averageNps?.toFixed(1) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('satisfaction_overview.average_csat')}
              </Typography>
              <Typography variant="h4" component="div">
                {averageCsat?.toFixed(1) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('satisfaction_overview.nps_by_criterion')}
            </Typography>
            {npsMetricsPerCriterion && npsMetricsPerCriterion.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={npsMetricsPerCriterion}
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
                  <Line type="monotone" dataKey="npsScore" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('satisfaction_overview.no_nps_data')}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('satisfaction_overview.rating_distribution')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ratingDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('satisfaction_overview.monthly_satisfaction_trend')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlySatisfactionTrend}
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
                <Legend />
                <Line type="monotone" dataKey="nps" stroke="#8884d8" name="NPS" />
                <Line type="monotone" dataKey="csat" stroke="#82ca9d" name="CSAT" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SatisfactionOverview;