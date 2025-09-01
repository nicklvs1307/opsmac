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
import { useSatisfactionAnalytics } from '../Avaliacoes/api/satisfactionService';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const SatisfactionOverview = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const { data: analyticsData, isLoading, isError, error } = useSatisfactionAnalytics(restaurantId);

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

  const { totalResponses, averageNps, averageCsat, npsMetricsPerCriterion } = analyticsData;

  // Placeholder data for rating distribution and trends
  const ratingDistributionData = [
    { name: '5 Estrelas', value: 400 },
    { name: '4 Estrelas', value: 300 },
    { name: '3 Estrelas', value: 200 },
    { name: '2 Estrelas', value: 100 },
    { name: '1 Estrela', value: 50 },
  ];

  const monthlySatisfactionTrend = [
    { name: 'Jan', nps: 50, csat: 4.2 },
    { name: 'Feb', nps: 55, csat: 4.5 },
    { name: 'Mar', nps: 60, csat: 4.0 },
    { name: 'Apr', nps: 58, csat: 4.3 },
    { name: 'May', nps: 62, csat: 4.6 },
    { name: 'Jun', nps: 65, csat: 4.8 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.satisfaction_overview_title')}
      </Typography>

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
