import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useEvolutionAnalytics } from '@/features/Dashboard/api/dashboardService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { useForm, FormProvider } from 'react-hook-form';
import EvolutionFilters from '../components/EvolutionFilters';

const Evolution = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const methods = useForm({
    defaultValues: {
      startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      granularity: 'month',
      selectedMetrics: ['checkins'],
    },
  });

  const { control, watch } = methods;

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const granularity = watch('granularity');
  const selectedMetrics = watch('selectedMetrics');

  const {
    data: evolutionData,
    isLoading,
    isError,
    error,
  } = useEvolutionAnalytics(restaurantId, {
    start_date: startDate,
    end_date: endDate,
    granularity,
  });

  const renderMetricLines = (metrics, t) => {
    const metricsConfig = [
      { key: 'checkins', color: '#8884d8', name: t('evolution.checkins') },
      { key: 'newCustomers', color: '#82ca9d', name: t('evolution.new_customers') },
      { key: 'surveys', color: '#ffc658', name: t('evolution.total_survey_responses') },
      { key: 'coupons', color: '#ff7300', name: t('evolution.redeemed_coupons') },
      { key: 'nps', color: '#0088FE', name: t('evolution.nps_score') },
      { key: 'csat', color: '#00C49F', name: t('evolution.csat_score') },
      { key: 'loyaltyPoints', color: '#FFBB28', name: t('evolution.total_loyalty_points') },
      { key: 'totalSpent', color: '#FF8042', name: t('evolution.total_spent_overall') },
      { key: 'engagementRate', color: '#AF19FF', name: t('evolution.engagement_rate') },
      { key: 'loyaltyRate', color: '#FF19FF', name: t('evolution.loyalty_rate') },
    ];

    return metricsConfig
      .filter((metric) => metrics.includes(metric.key))
      .map((metric) => (
        <Line
          key={metric.key}
          type="monotone"
          dataKey={metric.key}
          stroke={metric.color}
          name={metric.name}
        />
      ));
  };

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

  const transformedData = evolutionData || [];

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('fidelity_general.evolution_title')}
        </Typography>

        <EvolutionFilters control={control} onApplyFilters={() => { /* Filter logic is handled by watch */ }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('evolution.metrics_trend')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transformedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {renderMetricLines(selectedMetrics, t)}
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
};

export default Evolution;
