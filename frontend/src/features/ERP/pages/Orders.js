import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useOrders, useUpdateOrderStatus } from './Orders/api/ordersService';

const Orders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filterStatus, setFilterStatus] = useState('');

  const { data: orders, isLoading, isError } = useOrders(restaurantId, filterStatus);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ restaurantId, orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{t('orders.fetch_error')}</Alert>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'accepted':
        return 'blue';
      case 'preparing':
        return 'purple';
      case 'on_the_way':
        return 'teal';
      case 'delivered':
        return 'green';
      case 'concluded':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('orders.title')}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>{t('orders.filter_by_status')}</InputLabel>
          <Select
            value={filterStatus}
            label={t('orders.filter_by_status')}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="pending">{t('orders.status_pending')}</MenuItem>
            <MenuItem value="accepted">{t('orders.status_accepted')}</MenuItem>
            <MenuItem value="preparing">{t('orders.status_preparing')}</MenuItem>
            <MenuItem value="on_the_way">{t('orders.status_on_the_way')}</MenuItem>
            <MenuItem value="delivered">{t('orders.status_delivered')}</MenuItem>
            <MenuItem value="concluded">{t('orders.status_concluded')}</MenuItem>
            <MenuItem value="cancelled">{t('orders.status_cancelled')}</MenuItem>
            <MenuItem value="rejected">{t('orders.status_rejected')}</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={() => orders.refetch()}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {orders?.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ mt: 5 }}>
          {t('orders.no_orders_found')}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {orders?.map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('orders.order_id', {
                      id: order.external_order_id || order.id.substring(0, 8),
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('orders.customer', {
                      name: order.customer_details.name,
                      phone: order.customer_details.phone,
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('orders.type_platform', {
                      type: order.delivery_type,
                      platform: order.platform,
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('orders.date', { date: new Date(order.order_date).toLocaleString() })}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mt: 1, fontWeight: 'bold', color: getStatusColor(order.status) }}
                  >
                    {t('orders.status', { status: order.status.replace(/_/g, ' ').toUpperCase() })}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    {t('orders.items')}:
                  </Typography>
                  {order.items.map((item, index) => (
                    <Typography key={index} variant="body2">
                      {t('orders.item_details', {
                        quantity: item.quantity,
                        name: item.name,
                        price: Number(item.price).toFixed(2),
                      })}
                    </Typography>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" align="right">
                    {t('orders.total', { total: Number(order.total_amount).toFixed(2) })}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('orders.update_status')}</InputLabel>
                      <Select
                        value={order.status}
                        label={t('orders.update_status')}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updateStatusMutation.isLoading}
                      >
                        <MenuItem value="pending">{t('orders.status_pending')}</MenuItem>
                        <MenuItem value="accepted">{t('orders.status_accepted')}</MenuItem>
                        <MenuItem value="preparing">{t('orders.status_preparing')}</MenuItem>
                        <MenuItem value="on_the_way">{t('orders.status_on_the_way')}</MenuItem>
                        <MenuItem value="delivered">{t('orders.status_delivered')}</MenuItem>
                        <MenuItem value="concluded">{t('orders.status_concluded')}</MenuItem>
                        <MenuItem value="cancelled">{t('orders.status_cancelled')}</MenuItem>
                        <MenuItem value="rejected">{t('orders.status_rejected')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Orders;
