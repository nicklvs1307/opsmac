import React, { useState, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Grid, Button, MenuItem, Select, FormControl, InputLabel, IconButton, Divider, Switch, FormControlLabel, Paper } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Refresh as RefreshIcon, Store as StoreIcon, PointOfSale as PointOfSaleIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const fetchOrders = async ({ queryKey }) => {
  const [, filterStatus] = queryKey;
  const { data } = await axiosInstance.get(`/api/orders${filterStatus ? `?status=${filterStatus}` : ''}`);
  return data;
};

const fetchRestaurantStatus = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/api/restaurant/${restaurantId}`);
  return data;
};

const updateOrderStatus = async ({ orderId, status }) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/status`, { status });
  return data;
};

const updateRestaurantOpenStatus = async ({ restaurantId, is_open }) => {
  const { data } = await axiosInstance.put(`/api/restaurant/${restaurantId}/status/open`, { is_open });
  return data;
};

const updateRestaurantPosStatus = async ({ restaurantId, pos_status }) => {
  const { data } = await axiosInstance.put(`/api/restaurant/${restaurantId}/pos-status`, { pos_status });
  return data;
};

const Pdv = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filterStatus, setFilterStatus] = useState('');

  const { data: orders, isLoading: isLoadingOrders, isError: isErrorOrders } = useQuery(
    ['orders', filterStatus],
    fetchOrders,
    {
      enabled: !!restaurantId,
      refetchInterval: 5000, // Poll every 5 seconds for new orders
      onError: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        toast.error(`Erro ao carregar pedidos: ${error.response?.data?.msg || error.message}`);
      }
    }
  );

  const { data: restaurantStatus, isLoading: isLoadingRestaurantStatus, isError: isErrorRestaurantStatus } = useQuery(
    ['restaurantStatus', restaurantId],
    () => fetchRestaurantStatus(restaurantId),
    {
      enabled: !!restaurantId,
      refetchInterval: 15000, // Poll every 15 seconds for restaurant status
      onError: (error) => {
        console.error('Erro ao carregar status do restaurante:', error);
        toast.error(`Erro ao carregar status do restaurante: ${error.response?.data?.msg || error.message}`);
      }
    }
  );

  const updateOrderStatusMutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      toast.success('Status do pedido atualizado!');
      queryClient.invalidateQueries('orders');
    },
    onError: (error) => {
      console.error('Erro ao atualizar status do pedido:', error);
      toast.error(`Erro ao atualizar status do pedido: ${error.response?.data?.msg || error.message}`);
    }
  });

  const updateRestaurantOpenStatusMutation = useMutation(updateRestaurantOpenStatus, {
    onSuccess: () => {
      toast.success('Status da loja atualizado!');
      queryClient.invalidateQueries(['restaurantStatus', restaurantId]);
    },
    onError: (error) => {
      console.error('Erro ao atualizar status da loja:', error);
      toast.error(`Erro ao atualizar status da loja: ${error.response?.data?.msg || error.message}`);
    }
  });

  const updateRestaurantPosStatusMutation = useMutation(updateRestaurantPosStatus, {
    onSuccess: () => {
      toast.success('Status do PDV atualizado!');
      queryClient.invalidateQueries(['restaurantStatus', restaurantId]);
    },
    onError: (error) => {
      console.error('Erro ao atualizar status do PDV:', error);
      toast.error(`Erro ao atualizar status do PDV: ${error.response?.data?.msg || error.message}`);
    }
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleRestaurantOpenToggle = (event) => {
    updateRestaurantOpenStatusMutation.mutate({ restaurantId, is_open: event.target.checked });
  };

  const handlePosStatusToggle = (event) => {
    updateRestaurantPosStatusMutation.mutate({ restaurantId, pos_status: event.target.checked ? 'open' : 'closed' });
  };

  const orderStatuses = useMemo(() => [
    { id: 'pending', label: 'Pendente', color: 'orange' },
    { id: 'accepted', label: 'Aceito', color: 'blue' },
    { id: 'preparing', label: 'Em Preparo', color: 'purple' },
    { id: 'on_the_way', label: 'A Caminho', color: 'teal' },
    { id: 'delivered', label: 'Entregue', color: 'green' },
    { id: 'concluded', label: 'Concluído', color: 'green' },
    { id: 'cancelled', label: 'Cancelado', color: 'red' },
    { id: 'rejected', label: 'Rejeitado', color: 'red' },
  ], []);

  const ordersByStatus = useMemo(() => {
    const grouped = {};
    orderStatuses.forEach(status => {
      grouped[status.id] = orders?.filter(order => order.status === status.id) || [];
    });
    return grouped;
  }, [orders, orderStatuses]);

  if (isLoadingOrders || isLoadingRestaurantStatus) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorOrders || isErrorRestaurantStatus) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">Erro ao carregar dados do PDV. Verifique sua conexão ou tente novamente.</Alert>
      </Box>
    );
  }

  if (!restaurantId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="warning">Nenhum restaurante associado ao usuário. Não é possível acessar o PDV.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Painel do PDV</Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <FormControlLabel
          control={
            <Switch
              checked={restaurantStatus?.is_open || false}
              onChange={handleRestaurantOpenToggle}
              name="is_open"
              color="primary"
            />
          }
          label={
            <Box display="flex" alignItems="center">
              <StoreIcon sx={{ mr: 1 }} />
              <Typography>{restaurantStatus?.is_open ? 'Loja Aberta' : 'Loja Fechada'}</Typography>
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={restaurantStatus?.pos_status === 'open' || false}
              onChange={handlePosStatusToggle}
              name="pos_status"
              color="secondary"
            />
          }
          label={
            <Box display="flex" alignItems="center">
              <PointOfSaleIcon sx={{ mr: 1 }} />
              <Typography>{restaurantStatus?.pos_status === 'open' ? 'Caixa PDV Aberto' : 'Caixa PDV Fechado'}</Typography>
            </Box>
          }
        />
        <IconButton onClick={() => queryClient.invalidateQueries(['orders', 'restaurantStatus'])}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      <Grid container spacing={2} wrap="nowrap" sx={{ overflowX: 'auto', pb: 2 }}>
        {orderStatuses.map((statusCol) => (
          <Grid item key={statusCol.id} sx={{ minWidth: 300, maxWidth: 350 }}>
            <Paper elevation={3} sx={{ p: 2, bgcolor: '#f0f0f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ color: statusCol.color, fontWeight: 'bold' }}>
                {statusCol.label} ({ordersByStatus[statusCol.id]?.length || 0})
              </Typography>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                {ordersByStatus[statusCol.id]?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Nenhum pedido neste status.</Typography>
                ) : (
                  ordersByStatus[statusCol.id]?.map((order) => (
                    <Card key={order.id} variant="outlined" sx={{ mb: 2, bgcolor: 'white' }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">Pedido #{order.external_order_id || order.id.substring(0, 8)}</Typography>
                        <Typography variant="body2" color="text.secondary">Cliente: {order.customer_details.name} ({order.customer_details.phone})</Typography>
                        <Typography variant="body2" color="text.secondary">Tipo: {order.delivery_type} | Plataforma: {order.platform}</Typography>
                        <Typography variant="body2" color="text.secondary">Data: {new Date(order.order_date).toLocaleString()}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2">Itens:</Typography>
                        {order.items.map((item, idx) => (
                          <Typography key={idx} variant="body2" sx={{ ml: 1 }}>
                            - {item.quantity}x {item.name} (R$ {Number(item.price).toFixed(2)})
                          </Typography>
                        ))}
                        <Typography variant="h6" align="right" sx={{ mt: 1 }}>Total: R$ {Number(order.total_amount).toFixed(2)}</Typography>
                        
                        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                          <InputLabel>Mudar Status</InputLabel>
                          <Select
                            value={order.status}
                            label="Mudar Status"
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            {orderStatuses.map((statusOption) => (
                              <MenuItem key={statusOption.id} value={statusOption.id}>
                                {statusOption.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Pdv;
