import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { BarChart as BarChartIcon, PieChart as PieChartIcon } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from 'recharts';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const CouponAnalytics = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.get(`/api/coupons/analytics/restaurant/${restaurantId}`);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching coupon analytics:', err);
      setError(t('coupon_analytics.error_loading_analytics'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t('coupon_analytics.title')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {analytics?.total_coupons || 0}
            </Typography>
            <Typography variant="body2">{t('coupon_analytics.total_coupons')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {analytics?.redeemed_coupons || 0}
            </Typography>
            <Typography variant="body2">{t('coupon_analytics.redeemed_coupons')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {analytics?.expired_coupons || 0}
            </Typography>
            <Typography variant="body2">{t('coupon_analytics.expired_coupons')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {analytics?.expiring_soon_coupons || 0}
            </Typography>
            <Typography variant="body2">{t('coupon_analytics.expiring_soon_coupons')}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('coupon_analytics.coupons_by_type')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics?.coupons_by_type || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('coupon_analytics.coupons_redeemed_by_day')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.redeemed_by_day || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CouponAnalytics;
