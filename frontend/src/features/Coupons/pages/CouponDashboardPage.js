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
// Updated import path for couponQueries
import { useCouponAnalytics, useCoupons } from '@/features/Coupons/api/couponQueries';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CouponDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
    error: errorAnalytics,
  } = useCouponAnalytics(restaurantId);
  const {
    isLoading: isLoadingCoupons,
    isError: isErrorCoupons,
    error: errorCoupons,
  } = useCoupons({ restaurantId, params: {} }); // Pass params as an object

  if (isLoadingAnalytics || isLoadingCoupons) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isErrorAnalytics || isErrorCoupons) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorAnalytics?.message || errorCoupons?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  const totalCoupons = analyticsData?.total_coupons || 0;
  const redeemedCoupons = analyticsData?.redeemed_coupons || 0;
  const activeCoupons = analyticsData?.active_coupons || 0;
  const expiredCoupons = analyticsData?.expired_coupons || 0;

  // Example data for chart (you'd fetch this from backend or process existing data)
  const couponsCreatedOverTime = [
    { name: 'Jan', created: 400 },
    { name: 'Feb', created: 300 },
    { name: 'Mar', created: 200 },
    { name: 'Apr', created: 278 },
    { name: 'May', created: 189 },
    { name: 'Jun', created: 239 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('coupon_dashboard.title')}
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('coupon_dashboard.total_coupons')}
              </Typography>
              <Typography variant="h4" component="div">
                {totalCoupons}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('coupon_dashboard.redeemed_coupons')}
              </Typography>
              <Typography variant="h4" component="div">
                {redeemedCoupons}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('coupon_dashboard.active_coupons')}
              </Typography>
              <Typography variant="h4" component="div">
                {activeCoupons}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('coupon_dashboard.expired_coupons')}
              </Typography>
              <Typography variant="h4" component="div">
                {expiredCoupons}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('coupon_dashboard.coupons_created_over_time')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={couponsCreatedOverTime}
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
                <Line type="monotone" dataKey="created" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('coupon_dashboard.coupons_expiring_soon')}
            </Typography>
            {/* Placeholder for a list of expiring coupons */}
            <Typography variant="body2" color="text.secondary">
              {t('coupon_dashboard.expiring_soon_placeholder')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CouponDashboardPage;
