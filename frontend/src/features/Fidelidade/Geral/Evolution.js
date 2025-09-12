import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useEvolutionAnalytics } from '@/features/Dashboard/api/dashboardQueries';
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

const Evolution = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 6), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [granularity, setGranularity] = useState('month'); // Default to month
  const [selectedMetrics, setSelectedMetrics] = useState(['checkins']);

  const {
    data: evolutionData,
    isLoading,
    isError,
    error,
  } = useEvolutionAnalytics(restaurantId, { start_date: startDate, end_date: endDate, granularity });

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.evolution_title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}> {/* Changed md from 4 to 3 to make space for granularity */}
            <TextField
              label={t('evolution.start_date')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}> {/* Changed md from 4 to 3 */}
            <TextField
              label={t('evolution.end_date')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}> {/* New Grid item for granularity */}
            <FormControl fullWidth>
                <InputLabel>{t('evolution.granularity')}</InputLabel>
                <Select
                    value={granularity}
                    label={t('evolution.granularity')}
                    onChange={(e) => setGranularity(e.target.value)}
                >
                    <MenuItem value="day">{t('evolution.day')}</MenuItem>
                    <MenuItem value="week">{t('evolution.week')}</MenuItem>
                    <MenuItem value="month">{t('evolution.month')}</MenuItem>
                    <MenuItem value="year">{t('evolution.year')}</MenuItem>
                </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}> {/* Changed md from 4 to 3 */}
            <Button variant="contained" fullWidth>
              {t('evolution.apply_filters')}
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12}>
            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>{t('evolution.select_metrics')}</InputLabel>
                <Select
                    multiple
                    value={selectedMetrics}
                    onChange={(e) => setSelectedMetrics(e.target.value)}
                    renderValue={(selected) => selected.map(metric => t(`evolution.${metric}`)).join(', ')}
                >
                    <MenuItem value="checkins">{t('evolution.checkins')}</MenuItem>
                    <MenuItem value="newCustomers">{t('evolution.new_customers')}</MenuItem>
                    <MenuItem value="surveys">{t('evolution.total_survey_responses')}</MenuItem>
                    <MenuItem value="coupons">{t('evolution.redeemed_coupons')}</MenuItem>
                    <MenuItem value="nps">{t('evolution.nps_score')}</MenuItem>
                    <MenuItem value="csat">{t('evolution.csat_score')}</MenuItem>
                    <MenuItem value="loyaltyPoints">{t('evolution.total_loyalty_points')}</MenuItem>
                    <MenuItem value="totalSpent">{t('evolution.total_spent_overall')}</MenuItem>
                    <MenuItem value="engagementRate">{t('evolution.engagement_rate')}</MenuItem>
                    <MenuItem value="loyaltyRate">{t('evolution.loyalty_rate')}</MenuItem>
                </Select>
            </FormControl>
        </Grid>
      </Paper>

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
                {selectedMetrics.includes('checkins') && (
                    <Line
                        type="monotone"
                        dataKey="checkins"
                        stroke="#8884d8"
                        name={t('evolution.checkins')}
                    />
                )}
                {selectedMetrics.includes('newCustomers') && (
                    <Line
                        type="monotone"
                        dataKey="newCustomers"
                        stroke="#82ca9d"
                        name={t('evolution.new_customers')}
                    />
                )}
                {selectedMetrics.includes('surveys') && (
                    <Line
                        type="monotone"
                        dataKey="surveys"
                        stroke="#ffc658"
                        name={t('evolution.total_survey_responses')}
                    />
                )}
                {selectedMetrics.includes('coupons') && (
                    <Line
                        type="monotone"
                        dataKey="coupons"
                        stroke="#ff7300"
                        name={t('evolution.redeemed_coupons')}
                    />
                )}
                {selectedMetrics.includes('nps') && (
                    <Line
                        type="monotone"
                        dataKey="nps"
                        stroke="#0088FE"
                        name={t('evolution.nps_score')}
                    />
                )}
                {selectedMetrics.includes('csat') && (
                    <Line
                        type="monotone"
                        dataKey="csat"
                        stroke="#00C49F"
                        name={t('evolution.csat_score')}
                    />
                )}
                {selectedMetrics.includes('loyaltyPoints') && (
                    <Line
                        type="monotone"
                        dataKey="loyaltyPoints"
                        stroke="#FFBB28"
                        name={t('evolution.total_loyalty_points')}
                    />
                )}
                {selectedMetrics.includes('totalSpent') && (
                    <Line
                        type="monotone"
                        dataKey="totalSpent"
                        stroke="#FF8042"
                        name={t('evolution.total_spent_overall')}
                    />
                )}
                {selectedMetrics.includes('engagementRate') && (
                    <Line
                        type="monotone"
                        dataKey="engagementRate"
                        stroke="#AF19FF"
                        name={t('evolution.engagement_rate')}
                    />
                )}
                {selectedMetrics.includes('loyaltyRate') && (
                    <Line
                        type="monotone"
                        dataKey="loyaltyRate"
                        stroke="#FF19FF"
                        name={t('evolution.loyalty_rate')}
                    />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Evolution;