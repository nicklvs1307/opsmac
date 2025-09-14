import React from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';
import { useCouponAnalytics } from '@/features/Coupons/api/couponQueries';

const CouponAnalyticsPage = () => {
  const { t } = useTranslation();
  const { id: couponId } = useParams();

  const { data: analyticsData, isLoading, isError, error } = useCouponAnalytics(couponId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    console.error('Error fetching coupon analytics:', error);
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t('coupon_analytics.error_loading_analytics')}
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
              {analyticsData?.total_coupons || 0}
            </Typography>
            <Typography variant="body2">{t('coupon_analytics.total_coupons')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {analyticsData?.redeemed_coupons || 0}
            </Typography>
            <Typography variant="body2">{t('coupon_analytics.redeemed_coupons')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {analyticsData?.expired_coupons || 0}
            </Typography>
            <Typography variant="body2">{t('coupon_analytics.expired_coupons')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {analyticsData?.expiring_soon_coupons || 0}
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
              <ComposedChart data={analyticsData?.coupons_by_type || []}>
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
              <LineChart data={analyticsData?.redeemed_by_day || []}>
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

export default CouponAnalyticsPage;
