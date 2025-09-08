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
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useDashboardAnalytics } from '@/features/Dashboard/api/dashboardQueries';
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

  const {
    data: analyticsData,
    isLoading,
    isError,
    error,
  } = useDashboardAnalytics(restaurantId, { start_date: startDate, end_date: endDate });

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

  // Transform data for charts (assuming analyticsData provides daily/monthly aggregates)
  // For now, using placeholder data structure, assuming backend returns an array of daily/monthly stats
  const transformedData = analyticsData
    ? [
        {
          date: '2024-01',
          checkins: 100,
          newCustomers: 10,
          surveys: 50,
          coupons: 20,
          nps: 60,
          csat: 4.0,
        },
        {
          date: '2024-02',
          checkins: 120,
          newCustomers: 12,
          surveys: 55,
          coupons: 25,
          nps: 65,
          csat: 4.2,
        },
        {
          date: '2024-03',
          checkins: 110,
          newCustomers: 11,
          surveys: 60,
          coupons: 22,
          nps: 63,
          csat: 4.1,
        },
        {
          date: '2024-04',
          checkins: 130,
          newCustomers: 15,
          surveys: 65,
          coupons: 30,
          nps: 68,
          csat: 4.5,
        },
        {
          date: '2024-05',
          checkins: 140,
          newCustomers: 13,
          surveys: 70,
          coupons: 28,
          nps: 70,
          csat: 4.4,
        },
        {
          date: '2024-06',
          checkins: 150,
          newCustomers: 16,
          surveys: 75,
          coupons: 35,
          nps: 72,
          csat: 4.6,
        },
      ]
    : [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.evolution_title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label={t('evolution.start_date')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label={t('evolution.end_date')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button variant="contained" fullWidth>
              {t('evolution.apply_filters')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('evolution.checkins_trend')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transformedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="checkins"
                  stroke="#8884d8"
                  name={t('evolution.checkins')}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('evolution.new_customers_trend')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transformedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newCustomers"
                  stroke="#82ca9d"
                  name={t('evolution.new_customers')}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('evolution.nps_csat_trend')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transformedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="nps"
                  stroke="#ffc658"
                  name={t('evolution.nps_score')}
                />
                <Line
                  type="monotone"
                  dataKey="csat"
                  stroke="#ff7300"
                  name={t('evolution.csat_score')}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Evolution;
